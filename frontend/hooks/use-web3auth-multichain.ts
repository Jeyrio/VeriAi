"use client";

import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser, useWeb3Auth } from "@web3auth/modal/react";
import { useAccount, useBalance, useChainId } from "wagmi"; // Ethereum via Wagmi
import { useSolanaWallet } from "@web3auth/modal/react/solana"; // Solana
import { WALLET_CONNECTORS, AUTH_CONNECTION } from "@web3auth/modal";
import { getED25519Key } from "@web3auth/modal";
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { APP_CONFIG } from "@/lib/config";

// Phantom wallet type definitions
interface PhantomProvider {
  isPhantom: boolean;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  on(event: string, callback: (args: any) => void): void;
  request(method: any): Promise<any>;
}

// Extend Window interface to include Phantom
declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

/**
 * Comprehensive Multichain Web3Auth Hook
 * 
 * Combines patterns from:
 * - meta-pilot-frontend: Professional multichain address derivation
 * - web3-frontend-interview-project: Advanced state management patterns
 * 
 * Features:
 * - All Web3Auth login methods (social, email, SMS, wallets)
 * - Multichain support (Ethereum + Solana) with proper address derivation
 * - Professional error handling and loading states
 * - Real-time balance monitoring
 * - Initialization checks to prevent connection failures
 * - Universal address display for ALL authentication methods
 */

// Enhanced wallet status enum from web3-frontend-interview-project
export enum WalletStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  INITIALIZING = 'initializing'
}

// Multichain wallet state interface combining both patterns
export interface MultiChainWalletState {
  // Connection state
  status: WalletStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isInitialized: boolean;
  
  // Ethereum chain (via Wagmi)
  ethereum: {
    address?: string;
    isConnected: boolean;
    balance?: string;
    balanceFormatted?: string;
    symbol: string;
    chainId?: number;
    isLoading?: boolean;
  };
  
  // Solana chain (derived + direct)
  solana: {
    address?: string;
    isConnected: boolean;
    balance?: number;
    balanceFormatted?: string;
    symbol: string;
    connection?: Connection;
    isLoading?: boolean;
    network: string;
  };
  
  // User information
  userInfo?: any;
  connectorName?: string;
  authMethod?: string;
  
  // Error handling
  error?: string;
  lastConnectedAt?: number;
}

export function useWeb3AuthMultichain() {
  // Check if we're in a client environment first
  if (typeof window === 'undefined') {
    // Return safe default state for SSR
    return {
      status: WalletStatus.DISCONNECTED,
      isConnected: false,
      isConnecting: false,
      isInitialized: false,
      error: null,
      userInfo: null,
      ethereum: {
        address: undefined,
        isConnected: false,
        balance: '0',
        balanceFormatted: '0.00',
        symbol: 'ETH',
        chainId: 1,
        isLoading: false,
      },
      solana: {
        address: undefined,
        isConnected: false,
        balance: 0,
        balanceFormatted: '0.00',
        symbol: 'SOL',
        connection: null,
        isLoading: false,
        network: "devnet",
      },
      handleConnect: async () => {},
      handleDisconnect: () => {},
      fetchSolanaBalance: async () => {},
      formatAddress: (addr: string, chars: number = 6) => `${addr.slice(0, chars)}...${addr.slice(-chars)}`,
      deriveSolanaAddress: async () => null,
      deriveEthereumAddress: async () => null,
      address: undefined,
      balance: { formatted: "0", symbol: "ETH" },
      currentWallet: 'none',
      primaryAddress: undefined,
      activeEthereumAddress: undefined,
      activeSolanaAddress: undefined,
      hasEthereumAddress: false,
      hasSolanaAddress: false,
      isAnyChainConnected: false,
    };
  }

  // Guard against provider not being available
  try {
    // Web3Auth core hooks
    const { connect, isConnected, loading: connectLoading, error: connectError, connectorName } = useWeb3AuthConnect();
    const { disconnect, loading: disconnectLoading } = useWeb3AuthDisconnect();
    const { userInfo } = useWeb3AuthUser();
    const { provider, isInitialized } = useWeb3Auth();
  
    // Ethereum wallet hooks (Wagmi)
    const { address: ethAddress, isConnected: ethConnected } = useAccount();
    const { data: ethBalance, isLoading: ethBalanceLoading } = useBalance({
      address: ethAddress,
    });
    const chainId = useChainId();
  
    // Solana wallet hooks  
  const { accounts: solAccounts, connection: solConnection } = useSolanaWallet();
  
  // Local state for derived addresses and balances
  const [derivedSolanaAddress, setDerivedSolanaAddress] = useState<string | undefined>();
  const [phantomAddress, setPhantomAddress] = useState<string | undefined>();
  const [solanaBalance, setSolanaBalance] = useState<number | undefined>();
  const [solanaBalanceLoading, setSolanaBalanceLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<string | undefined>();
  
  // Connection state management to prevent infinite loops
  const connectionAttemptRef = useRef(false);
  const derivationAttemptRef = useRef(false);
  const metamaskConnectionRef = useRef(false);
  
  // Solana connection with devnet by default
  const solanaConnection = useMemo(() => {
    return new Connection(APP_CONFIG.solana.rpcUrl);
  }, []);
  
  // Derive Solana address from Web3Auth private key (meta-pilot-frontend pattern)
  const deriveSolanaAddress = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !provider) {
      console.log('🔑 Cannot derive Solana address: not connected or no provider');
      return null;
    }

    try {
      console.log('🔑 Deriving Solana address from Web3Auth private key...');
      console.log('🔑 Provider available:', !!provider);
      console.log('🔑 Connection status:', isConnected);
      console.log('🔑 Connector name:', connectorName);
      
      // Get the Ethereum private key from Web3Auth
      const ethPrivateKey = await provider.request({
        method: "private_key",
      });
      
      console.log('🔑 Got private key:', !!ethPrivateKey);
      
      // Convert to ED25519 key for Solana
      const privateKey = getED25519Key(ethPrivateKey as string).sk.toString("hex");
      const secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
      const keypair = Keypair.fromSecretKey(secretKey);
      const address = keypair.publicKey.toBase58();
      
      console.log('✅ Successfully derived Solana address:', address);
      return address;
    } catch (error) {
      console.error('❌ Error deriving Solana address:', error);
      return null;
    }
  }, [provider, isConnected, connectorName]);
  
  // Derive Ethereum address from Web3Auth connection (for Solana-first connections)
  const deriveEthereumAddress = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !provider) {
      return null;
    }

    try {
      console.log('🔑 Deriving Ethereum address from Web3Auth connection...');
      
      // Get accounts from Web3Auth - this works for both social login and external wallets
      const accounts = await provider.request({
        method: "eth_accounts",
      }) as string[];
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        console.log('✅ Found Ethereum address:', accounts[0]);
        return accounts[0];
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error deriving Ethereum address:', error);
      return null;
    }
  }, [isConnected, provider]);
  
  // Local state for derived addresses  
  const [derivedEthereumAddress, setDerivedEthereumAddress] = useState<string | undefined>();
  
  // Fetch Solana balance
  const fetchSolanaBalance = useCallback(async (address: string): Promise<number | null> => {
    if (!address || !solanaConnection) {
      return null;
    }

    setSolanaBalanceLoading(true);
    try {
      const publicKey = new PublicKey(address);
      const balanceInLamports = await solanaConnection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      
      console.log('💰 Solana balance fetched:', balanceInSOL, 'SOL');
      return balanceInSOL;
    } catch (error) {
      console.error('❌ Error fetching Solana balance:', error);
      return null;
    } finally {
      setSolanaBalanceLoading(false);
    }
  }, [solanaConnection]);
  
  // Detect and connect to Phantom wallet for external wallet users
  const detectPhantomWallet = useCallback(async (): Promise<string | null> => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return null;
      
      // Check if Phantom is installed
      const isPhantomInstalled = window.solana && window.solana.isPhantom;
      
      if (!isPhantomInstalled || !window.solana) {
        console.log('👻 Phantom wallet not detected');
        return null;
      }
      
      console.log('👻 Phantom wallet detected, attempting to connect...');
      
      // Connect to Phantom
      const response = await window.solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      
      console.log('✅ Phantom wallet connected:', address);
      return address;
    } catch (error) {
      console.error('❌ Error connecting to Phantom wallet:', error);
      return null;
    }
  }, []);
  
  // Check for Phantom wallet ONLY when user explicitly connects via Phantom
  useEffect(() => {
    const checkPhantom = async () => {
      // Only check for Phantom if:
      // 1. No Phantom address yet
      // 2. Not currently attempting connection
      // 3. User is NOT connected via Web3Auth/MetaMask (to avoid wallet mixing)
      const isWeb3AuthConnected = isConnected && connectorName;
      
      if (!phantomAddress && !connectionAttemptRef.current && !isWeb3AuthConnected) {
        connectionAttemptRef.current = true;
        console.log('🔍 Checking for Phantom wallet...');
        const phantomAddr = await detectPhantomWallet();
        setPhantomAddress(phantomAddr || undefined);
        
        // Fetch balance for Phantom address
        if (phantomAddr) {
          const balance = await fetchSolanaBalance(phantomAddr);
          setSolanaBalance(balance || undefined);
        }
        
        // Reset after delay
        setTimeout(() => {
          connectionAttemptRef.current = false;
        }, 3000);
      }
    };
    
    checkPhantom();
  }, [phantomAddress, isConnected, connectorName]);
  
  // Update derived Solana address when Web3Auth connection changes
  useEffect(() => {
    const updateSolanaAddress = async () => {
      if (isConnected && provider && !derivationAttemptRef.current) {
        derivationAttemptRef.current = true;
        console.log('🔗 Web3Auth connected, connector:', connectorName);
        console.log('🔑 Attempting to derive Solana address...');
        const address = await deriveSolanaAddress();
        console.log('🔑 Derived Solana address:', address);
        setDerivedSolanaAddress(address || undefined);
        
        // Fetch balance for derived address
        if (address) {
          const balance = await fetchSolanaBalance(address);
          setSolanaBalance(balance || undefined);
        }
        
        // Reset the flag after a delay to allow for re-derivation if needed
        setTimeout(() => {
          derivationAttemptRef.current = false;
        }, 5000);
      } else if (!isConnected) {
        derivationAttemptRef.current = false;
        setDerivedSolanaAddress(undefined);
        setSolanaBalance(undefined);
      }
    };

    updateSolanaAddress();
  }, [isConnected, provider, connectorName]);
  
  // Update derived Ethereum address when Web3Auth connection changes  
  useEffect(() => {
    const updateEthereumAddress = async () => {
      if (isConnected && provider && !ethAddress) {
        // Only derive if wagmi doesn't already have an address
        const address = await deriveEthereumAddress();
        setDerivedEthereumAddress(address || undefined);
      } else if (!isConnected) {
        setDerivedEthereumAddress(undefined);
      }
    };

    updateEthereumAddress();
  }, [isConnected, provider, ethAddress]);
  
  // Auto-refresh Solana balance periodically
  useEffect(() => {
    const solanaAddr = derivedSolanaAddress || solAccounts?.[0];
    if (!solanaAddr) return;
    
    const interval = setInterval(async () => {
      const balance = await fetchSolanaBalance(solanaAddr);
      setSolanaBalance(balance || undefined);
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [derivedSolanaAddress, solAccounts, fetchSolanaBalance]);
  
  // Simple connect handler for Web3Auth built-in modal
  const handleConnect = useCallback(async () => {
    try {
      // Prevent concurrent connection attempts
      if (metamaskConnectionRef.current) {
        console.log('⚠️ Connection already in progress, skipping...');
        return;
      }
      
      metamaskConnectionRef.current = true;
      console.log('🔗 Starting Web3Auth connection...');
      console.log('🔧 Provider initialized:', !!provider);
      console.log('🔧 Web3Auth initialized:', isInitialized);
      
      // Wait for initialization if needed
      if (!isInitialized) {
        console.log('⏳ Waiting for Web3Auth initialization...');
        // Give it a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await connect(); // This will show Web3Auth's built-in modal with all options
      console.log('✅ Web3Auth connection initiated');
    } catch (error) {
      console.error("❌ Web3Auth connection failed:", error);
      throw error;
    } finally {
      // Reset connection flag after attempt
      setTimeout(() => {
        metamaskConnectionRef.current = false;
      }, 2000);
    }
  }, [connect, provider, isInitialized]);

  // Unified disconnect handler
  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      setAuthMethod(undefined);
      setDerivedSolanaAddress(undefined);
      setDerivedEthereumAddress(undefined);
      setSolanaBalance(undefined);
    } catch (error) {
      console.error("Disconnect failed:", error);
      throw error;
    }
  }, [disconnect]);

  // Address formatting utility
  const formatAddress = useCallback((addr?: string, chars = 4) => {
    if (!addr) return "";
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
  }, []);

  // Determine wallet status - simplified without isInitialized check
  const status: WalletStatus = useMemo(() => {
    if (connectLoading || disconnectLoading) return WalletStatus.CONNECTING;
    if (connectError) return WalletStatus.ERROR;
    if (isConnected) return WalletStatus.CONNECTED;
    return WalletStatus.DISCONNECTED;
  }, [connectLoading, disconnectLoading, connectError, isConnected]);

  // Get the primary address (prioritize Ethereum, then Solana)
  const primaryAddress = useMemo(() => {
    return ethAddress || derivedEthereumAddress || derivedSolanaAddress || solAccounts?.[0];
  }, [ethAddress, derivedEthereumAddress, derivedSolanaAddress, solAccounts]);

  // Get active Ethereum address (direct or derived)
  const activeEthereumAddress = useMemo(() => {
    return ethAddress || derivedEthereumAddress;
  }, [ethAddress, derivedEthereumAddress]);

  // Get active Solana address (derived or direct) - WALLET-SPECIFIC
  const activeSolanaAddress = useMemo(() => {
    // Determine which wallet is connected first
    const connectedWallet = connectorName || (window.solana?.isPhantom ? 'phantom' : null);
    
    console.log('🔍 Wallet address selection:');
    console.log('  - Connected wallet:', connectedWallet);
    console.log('  - Derived Solana (from Web3Auth/MetaMask):', derivedSolanaAddress);
    console.log('  - Phantom address:', phantomAddress);
    console.log('  - Sol accounts:', solAccounts?.[0]);
    
    // Only use addresses from the connected wallet to avoid mixing wallets
    if (connectedWallet && connectedWallet !== 'phantom') {
      // User connected via Web3Auth/MetaMask - only use derived address from that wallet
      console.log('  ✅ Using derived Solana address from', connectedWallet);
      return derivedSolanaAddress;
    } else if (window.solana?.isPhantom && phantomAddress) {
      // User connected via Phantom - only use Phantom address
      console.log('  ✅ Using Phantom wallet address');
      return phantomAddress;
    } else if (solAccounts?.[0]) {
      // Fallback to Web3Auth Solana account if available
      console.log('  ✅ Using Web3Auth Solana account');
      return solAccounts[0];
    }
    
    // No wallet-specific Solana address available
    console.log('  ❌ No wallet-specific Solana address found');
    return undefined;
  }, [derivedSolanaAddress, phantomAddress, solAccounts, connectorName]);

  // Build comprehensive wallet state
  const walletState: MultiChainWalletState = useMemo(() => ({
    // Connection state
    status,
    isConnected,
    isConnecting: connectLoading || disconnectLoading,
    isInitialized,
    
    // Ethereum state - use derived address if direct not available
    ethereum: {
      address: activeEthereumAddress,
      isConnected: !!activeEthereumAddress,
      balance: ethBalance?.value?.toString(),
      balanceFormatted: ethBalance ? `${Number(ethBalance.value) / Math.pow(10, ethBalance.decimals)}` : undefined,
      symbol: ethBalance?.symbol || "ETH",
      chainId: chainId,
      isLoading: ethBalanceLoading,
    },
    
    // Solana state  
    solana: {
      address: activeSolanaAddress,
      isConnected: !!activeSolanaAddress,
      balance: solanaBalance,
      balanceFormatted: solanaBalance?.toFixed(4),
      symbol: "SOL",
      connection: solConnection || solanaConnection,
      isLoading: solanaBalanceLoading,
      network: "devnet",
    },
    
    // User and auth info
    userInfo,
    connectorName: connectorName || undefined,
    authMethod,
    
    // Error handling
    error: connectError?.message,
    lastConnectedAt: isConnected ? Date.now() : undefined,
  }), [
    status, isConnected, connectLoading, disconnectLoading, isInitialized,
    activeEthereumAddress, ethConnected, ethBalance, chainId, ethBalanceLoading,
    activeSolanaAddress, solanaBalance, solanaBalanceLoading, solConnection, solanaConnection,
    userInfo, connectorName, authMethod, connectError
  ]);

  return {
    // Complete wallet state
    ...walletState,
    
    // Connection methods
    connect, // Raw Web3Auth connect function for built-in modal
    handleConnect, // Wrapper with initialization checks
    handleDisconnect,
    
    // Utility functions
    formatAddress,
    deriveSolanaAddress,
    deriveEthereumAddress,
    fetchSolanaBalance,
    
    // Legacy compatibility for existing components
    address: primaryAddress,
    balance: { formatted: ethBalance ? `${ethBalance.value}` : "0", symbol: ethBalance?.symbol || "ETH" },
    currentWallet: activeEthereumAddress ? 'ethereum' : activeSolanaAddress ? 'solana' : 'none',
    
    // Quick access properties
    primaryAddress,
    activeEthereumAddress,
    activeSolanaAddress,
    hasEthereumAddress: !!activeEthereumAddress,
    hasSolanaAddress: !!activeSolanaAddress,
    isAnyChainConnected: !!activeEthereumAddress || !!activeSolanaAddress,
  };
  } catch (error) {
    // Return safe default state when Web3Auth provider is not available
    console.warn('Web3Auth provider not available, returning default state:', error);
    return {
      // Connection state
      status: WalletStatus.DISCONNECTED,
      isConnected: false,
      isConnecting: false,
      isInitialized: false,
      
      // Error state
      error: error instanceof Error ? error.message : 'Web3Auth provider not available',
      
      // User data
      userInfo: null,
      primaryAddress: undefined,
      
      // Chain-specific data
      ethereum: {
        address: undefined,
        isConnected: false,
        balance: '0',
        balanceFormatted: '0.00',
        symbol: 'ETH',
        chainId: 1,
        isLoading: false,
      },
      
      solana: {
        address: undefined,
        isConnected: false,
        balance: 0,
        balanceFormatted: '0.00',
        symbol: 'SOL',
        connection: new Connection(APP_CONFIG.solana.rpcUrl),
        isLoading: false,
        network: "devnet",
      },
      
      // Action handlers
      handleConnect: async () => {
        throw new Error('Web3Auth provider not available');
      },
      handleDisconnect: () => {
        console.warn('Cannot disconnect - Web3Auth provider not available');
      },
      fetchSolanaBalance: async () => {
        console.warn('Cannot fetch Solana balance - Web3Auth provider not available');
      },
      
      // Additional utility props
      activeEthereumAddress: undefined,
      activeSolanaAddress: undefined,
      hasEthereumAddress: false,
      hasSolanaAddress: false,
      isAnyChainConnected: false,
      formatAddress: (addr?: string, chars = 4) => {
        if (!addr) return "";
        if (addr.length <= 8) return addr;
        return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
      },
    };
  }
}

export default useWeb3AuthMultichain;