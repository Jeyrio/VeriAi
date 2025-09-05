"use client";

import { useWeb3AuthMultichain, WalletStatus } from './use-web3auth-multichain';

/**
 * @title useVeriAIWallet - Compatibility Layer
 * @dev Maintains VeriAI's existing interface while using the fixed multichain hook
 * Preserves all signature mechanisms and existing functionality
 * @author VeriAI Team
 */

export interface VeriAIUser {
  userInfo?: any;
  walletAddress?: string;
  accountId?: string;
  
  // Enhanced with multichain support
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
  
  // Current active chain info
  activeChain: 'ethereum' | 'solana' | 'none';
  walletType: WalletStatus;
  
  // Profile (maintained for compatibility)
  profile: {
    name?: string;
    email?: string;
    verificationCount?: number;
    nftCount?: number;
  };
}

interface VeriAIWalletContextType {
  user: VeriAIUser | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Enhanced functionality
  switchToChain: (chain: 'ethereum' | 'solana') => void;
  refreshBalances: () => Promise<void>;
  
  // Status and error handling
  connectLoading: boolean;
  connectError: any;
  disconnectLoading: boolean;
  
  // Utility functions
  formatAddress: (address?: string) => string;
  
  // Chain-specific actions for VeriAI
  requestVerification: (prompt: string, model: string) => Promise<any>;
  getVerificationHistory: () => Promise<any[]>;
  getUserNFTs: () => Promise<any[]>;
}

export function useVeriAIWallet(): VeriAIWalletContextType {
  const wallet = useWeb3AuthMultichain();
  
  // Build VeriAI user object
  const user: VeriAIUser | null = wallet.isConnected ? {
    userInfo: wallet.userInfo,
    walletAddress: wallet.primaryAddress,
    accountId: wallet.primaryAddress,
    
    ethereum: {
      address: wallet.ethereum.address,
      isConnected: wallet.ethereum.isConnected,
      chainId: wallet.ethereum.chainId,
      balance: wallet.ethereum.balanceFormatted,
    },
    
    solana: {
      address: wallet.solana.address,
      isConnected: wallet.solana.isConnected,
      balance: wallet.solana.balanceFormatted,
    },
    
    activeChain: wallet.hasEthereumAddress ? 'ethereum' : wallet.hasSolanaAddress ? 'solana' : 'none',
    walletType: wallet.status,
    
    profile: {
      name: wallet.userInfo?.name,
      email: wallet.userInfo?.email,
      verificationCount: 0, // Will be fetched from backend
      nftCount: 0, // Will be fetched from backend
    }
  } : null;

  // Chain switching logic (for future use)
  const switchToChain = (chain: 'ethereum' | 'solana') => {
    console.log(`🔄 Switching to ${chain} chain...`);
    // Implementation would depend on the specific requirements
    // For now, this is informational
  };

  // Refresh balances for both chains
  const refreshBalances = async () => {
    try {
      if (wallet.solana.address) {
        await wallet.fetchSolanaBalance(wallet.solana.address);
      }
      // Ethereum balance is handled by wagmi automatically
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  // VeriAI-specific functions that will integrate with backend
  const requestVerification = async (prompt: string, model: string) => {
    if (!wallet.primaryAddress) {
      throw new Error('No wallet connected');
    }
    
    // This will call the VeriAI backend service
    // Backend will handle the appropriate chain based on active chain
    const activeChain = wallet.hasEthereumAddress ? 'ethereum' : wallet.hasSolanaAddress ? 'solana' : 'none';
    console.log(`📝 Requesting verification on ${activeChain} chain:`, {
      prompt,
      model,
      address: wallet.primaryAddress,
      chain: activeChain
    });
    
    // Implementation will be in the backend service
    return {
      requestId: 'mock-request-id',
      chain: activeChain,
      address: wallet.primaryAddress
    };
  };

  const getVerificationHistory = async () => {
    if (!wallet.primaryAddress) return [];
    
    // Fetch from VeriAI backend based on primary address and chain
    const activeChain = wallet.hasEthereumAddress ? 'ethereum' : wallet.hasSolanaAddress ? 'solana' : 'none';
    console.log(`📋 Fetching verification history for ${wallet.primaryAddress} on ${activeChain}`);
    
    return []; // Will be implemented with backend integration
  };

  const getUserNFTs = async () => {
    if (!wallet.primaryAddress) return [];
    
    // Fetch NFTs based on primary chain
    const activeChain = wallet.hasEthereumAddress ? 'ethereum' : wallet.hasSolanaAddress ? 'solana' : 'none';
    console.log(`🎨 Fetching NFTs for ${wallet.primaryAddress} on ${activeChain}`);
    
    return []; // Will be implemented with backend integration
  };

  return {
    // Core state
    user,
    isConnected: wallet.isConnected,
    isLoading: wallet.isConnecting,
    
    // Connection methods
    connectWallet: wallet.handleConnect,
    disconnectWallet: wallet.handleDisconnect,
    
    // Enhanced functionality
    switchToChain,
    refreshBalances,
    
    // Status
    connectLoading: wallet.isConnecting,
    connectError: (wallet as any).error || null,
    disconnectLoading: false, // Not available in multichain hook
    
    // Utilities
    formatAddress: (address?: string) => wallet.formatAddress(address || ''),
    
    // VeriAI-specific functions
    requestVerification,
    getVerificationHistory,
    getUserNFTs,
  };
}

// Export for backward compatibility
export const useAuth = useVeriAIWallet;
