import { useState, useEffect, useRef, useCallback } from 'react';
import { APP_CONFIG } from '@/lib/config';
import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(url?: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyClosedRef = useRef(false);

  const socketUrl = url || APP_CONFIG.api.baseUrl;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    setConnectionState('connecting');
    isManuallyClosedRef.current = false;

    try {
      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectInterval,
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        setConnectionState('connected');
        setReconnectAttempts(0);
        onConnect?.();
      });

      socketRef.current.on('message', (data: any) => {
        try {
          const message: WebSocketMessage = {
            type: data.type || 'message',
            data: data.data || data,
            timestamp: Date.now(),
          };
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse Socket.IO message:', error);
        }
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        onDisconnect?.();
      });

      socketRef.current.on('connect_error', (error) => {
        setConnectionState('error');
        onError?.(error as any);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
        }
      });

      // Listen for verification updates
      socketRef.current.on('verification-update', (data) => {
        const message: WebSocketMessage = {
          type: 'verification-update',
          data,
          timestamp: Date.now(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      // Listen for NFT updates
      socketRef.current.on('nft-update', (data) => {
        const message: WebSocketMessage = {
          type: 'nft-update',
          data,
          timestamp: Date.now(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

    } catch (error) {
      setConnectionState('error');
      console.error('Failed to create Socket.IO connection:', error);
    }
  }, [socketUrl, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts, reconnectAttempts]);

  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', message);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionState,
    lastMessage,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
  };
}

// Hook for verification status updates
export function useVerificationWebSocket(verificationId?: string) {
  const [status, setStatus] = useState<string>('pending');
  const [updates, setUpdates] = useState<any[]>([]);

  const { isConnected, sendMessage } = useWebSocket(undefined, {
    onMessage: (message) => {
      if (message.type === 'verification_update') {
        const { id, status: newStatus, data } = message.data;
        if (!verificationId || id === verificationId) {
          setStatus(newStatus);
          setUpdates(prev => [...prev, { ...data, timestamp: message.timestamp }]);
        }
      }
    },
    onConnect: () => {
      if (verificationId) {
        sendMessage({
          type: 'subscribe-verification',
          data: verificationId
        });
      }
    }
  });

  const subscribeToVerification = useCallback((id: string) => {
    if (isConnected) {
      sendMessage({
        type: 'subscribe-verification',
        data: id
      });
    }
  }, [isConnected, sendMessage]);

  return {
    status,
    updates,
    isConnected,
    subscribeToVerification,
  };
}

// Hook for AI generation status updates
export function useAIGenerationWebSocket(generationId?: string) {
  const [status, setStatus] = useState<string>('pending');
  const [progress, setProgress] = useState<number>(0);
  const [output, setOutput] = useState<string>('');

  const { isConnected, sendMessage } = useWebSocket(undefined, {
    onMessage: (message) => {
      if (message.type === 'generation_update') {
        const { id, status: newStatus, progress: newProgress, output: newOutput } = message.data;
        if (!generationId || id === generationId) {
          setStatus(newStatus);
          if (newProgress !== undefined) setProgress(newProgress);
          if (newOutput !== undefined) setOutput(newOutput);
        }
      }
    },
    onConnect: () => {
      if (generationId) {
        sendMessage({
          type: 'subscribe_generation',
          data: { generationId }
        });
      }
    }
  });

  const subscribeToGeneration = useCallback((id: string) => {
    if (isConnected) {
      sendMessage({
        type: 'subscribe_generation',
        data: { generationId: id }
      });
    }
  }, [isConnected, sendMessage]);

  return {
    status,
    progress,
    output,
    isConnected,
    subscribeToGeneration,
  };
}
