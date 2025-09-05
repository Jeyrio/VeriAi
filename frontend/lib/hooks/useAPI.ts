import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { verificationApi, nftApi, aiApi } from '@/lib/api/client';

// Hook for verification operations
export function useVerification() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestVerification = async (data: {
    prompt: string;
    model: string;
    output: string;
  }) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await verificationApi.requestVerification({
        ...data,
        userAddress: address,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Verification request failed');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getVerification = async (requestId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await verificationApi.getVerification(requestId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get verification');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserVerifications = async (options?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    if (!address) return { verifications: [], total: 0, page: 1, limit: 10 };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await verificationApi.getUserVerifications(address, options);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get user verifications');
      }
      
      return response.data || { verifications: [], total: 0, page: 1, limit: 10 };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { verifications: [], total: 0, page: 1, limit: 10 };
    } finally {
      setLoading(false);
    }
  };

  return {
    requestVerification,
    getVerification,
    getUserVerifications,
    loading,
    error,
  };
}

// Hook for AI generation operations
export function useAIGeneration() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (data: {
    prompt: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
  }) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiApi.generateContent({
        ...data,
        userAddress: address,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Generation request failed');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getGeneration = async (requestId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiApi.getGeneration(requestId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get generation');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateOutput = async (data: {
    prompt: string;
    output: string;
    model: string;
    expectedHash: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiApi.validateOutput(data);
      
      if (!response.success) {
        throw new Error(response.error || 'Validation failed');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateContent,
    getGeneration,
    validateOutput,
    loading,
    error,
  };
}

// Hook for NFT operations
export function useNFT() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserNFTs = async () => {
    if (!address) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await nftApi.getUserNFTs(address);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get user NFTs');
      }
      
      return response.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async (data: {
    verificationId: string;
    metadataUri: string;
  }) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await nftApi.mintNFT({
        ...data,
        userAddress: address,
      });
      
      if (!response.success) {
        throw new Error(response.error || 'NFT minting failed');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNFTMetadata = async (tokenId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await nftApi.getNFTMetadata(tokenId);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get NFT metadata');
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getUserNFTs,
    mintNFT,
    getNFTMetadata,
    loading,
    error,
  };
}

// Hook for polling operations
export function usePolling<T>(
  pollingFunction: () => Promise<T>,
  interval: number = 2000,
  condition?: (data: T) => boolean
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;

      try {
        setLoading(true);
        const result = await pollingFunction();
        
        if (isActive) {
          setData(result);
          setError(null);
          
          // Continue polling if condition is not met
          if (!condition || !condition(result)) {
            timeoutId = setTimeout(poll, interval);
          }
        }
      } catch (err) {
        if (isActive) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          timeoutId = setTimeout(poll, interval);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    poll();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pollingFunction, interval, condition]);

  return { data, loading, error };
}
