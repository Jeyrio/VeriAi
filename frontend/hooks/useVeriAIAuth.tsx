"use client";

// Compatibility hook for Web3Auth integration
// This provides backward compatibility for existing components while using the real multichain hook

import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain";

export type UserRole = 'creator' | 'verifier' | 'buyer' | null;

export interface VeriAIUser {
  userInfo?: any;
  walletAddress?: string;
  accountId?: string;
  ethereum?: {
    address?: string;
    isConnected: boolean;
    chainId?: number;
    balance?: string;
  };
  solana?: {
    address?: string;
    isConnected: boolean;
    balance?: string;
  };
  role: UserRole;
  profile: {
    name?: string;
    email?: string;
    aiModels?: string[];
    experience?: string;
    reputation?: number;
  };
}

interface VeriAIAuthContextType {
  user: VeriAIUser | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setUserRole: (role: UserRole) => void;
  updateProfile: (profile: Partial<VeriAIUser['profile']>) => void;
  refreshBalances: () => Promise<void>;
  connectLoading: boolean;
  connectError: any;
  disconnectLoading: boolean;
  disconnectError: any;
}

// VeriAI compatibility hook that uses the multichain hook
export function useVeriAIAuth(): VeriAIAuthContextType {
  try {
    const wallet = useWeb3AuthMultichain();
    
    // Map multichain wallet data to VeriAI interface
    const user: VeriAIUser | null = wallet.isConnected ? {
      userInfo: wallet.userInfo,
      walletAddress: wallet.primaryAddress,
      accountId: wallet.primaryAddress,
      ethereum: {
        address: wallet.ethereum.address,
        isConnected: wallet.ethereum.isConnected,
        chainId: wallet.ethereum.chainId,
        balance: wallet.ethereum.balance,
      },
      solana: {
        address: wallet.solana.address,
        isConnected: wallet.solana.isConnected,
        balance: wallet.solana.balance?.toString(),
      },
      role: null, // Default role
      profile: {
        name: wallet.userInfo?.name,
        email: wallet.userInfo?.email,
        aiModels: [],
        experience: '',
        reputation: 0,
      }
    } : null;

    return {
      user,
      isConnected: wallet.isConnected,
      isLoading: wallet.isConnecting,
      connectWallet: wallet.handleConnect,
      disconnectWallet: wallet.handleDisconnect,
      setUserRole: () => {}, // Not implemented in multichain hook
      updateProfile: () => {}, // Not implemented in multichain hook
      refreshBalances: async () => {
        if (wallet.solana.address) {
          await wallet.fetchSolanaBalance(wallet.solana.address);
        }
      },
      connectLoading: wallet.isConnecting,
      connectError: wallet.error,
      disconnectLoading: false, // Not available in multichain hook
      disconnectError: null,
    };
  } catch (error) {
    // Return safe default state when Web3Auth is not available
    console.warn('VeriAI Web3Auth context not available, returning default state:', error);
    return {
      user: null,
      isConnected: false,
      isLoading: false,
      connectWallet: async () => {
        console.warn('Cannot connect - VeriAI Web3Auth context not available');
      },
      disconnectWallet: () => {
        console.warn('Cannot disconnect - VeriAI Web3Auth context not available');
      },
      setUserRole: () => {},
      updateProfile: () => {},
      refreshBalances: async () => {},
      connectLoading: false,
      connectError: error,
      disconnectLoading: false,
      disconnectError: null,
    };
  }
}

// Export aliases for backward compatibility
export const useAuth = useVeriAIAuth;
export const useWeb3Auth = useVeriAIAuth;