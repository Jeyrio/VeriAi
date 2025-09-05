// VeriAI Web3Auth Context - Replaced old Flare/RainbowKit implementation
import React, { createContext, useContext, ReactNode } from 'react';
import { useWeb3AuthMultichain } from '@/hooks/use-web3auth-multichain';
import { toast } from 'sonner';

interface VeriAIWalletContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address?: string;
  
  // Multichain state
  primaryChain: 'ethereum' | 'solana' | 'none';
  ethereum: {
    address?: string;
    isConnected: boolean;
    chainId?: number;
    balance?: string;
  };
  solana: {
    address?: string;
    isConnected: boolean;
    balance?: string;
  };
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Status
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

const VeriAIWalletContext = createContext<VeriAIWalletContextType | undefined>(undefined);

interface VeriAIWalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: VeriAIWalletProviderProps) {
  const wallet = useWeb3AuthMultichain();
  
  const value: VeriAIWalletContextType = {
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    address: wallet.primaryAddress,
    primaryChain: wallet.hasEthereumAddress ? 'ethereum' : wallet.hasSolanaAddress ? 'solana' : 'none',
    ethereum: wallet.ethereum,
    solana: {
      address: wallet.solana.address,
      isConnected: wallet.solana.isConnected,
      balance: wallet.solana.balance?.toString(),
    },
    connectWallet: wallet.handleConnect,
    disconnectWallet: wallet.handleDisconnect,
    connectionStatus: wallet.isConnecting ? 'connecting' : 
                     wallet.isConnected ? 'connected' : 
                     wallet.error ? 'error' : 'disconnected',
  };

  return (
    <VeriAIWalletContext.Provider value={value}>
      {children}
    </VeriAIWalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(VeriAIWalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a VeriAI WalletProvider');
  }
  return context;
}

// Enhanced VeriAI wallet hooks
export function useWalletActions() {
  const wallet = useWallet();

  const requireConnection = (action: string = 'perform this action') => {
    if (!wallet.isConnected) {
      toast.error('Wallet not connected', {
        description: `Please connect your wallet to ${action}.`,
        action: {
          label: 'Connect Wallet',
          onClick: () => wallet.connectWallet(),
        },
      });
      return false;
    }
    return true;
  };

  const requireEthereum = (action: string = 'perform this action') => {
    if (!wallet.ethereum.isConnected) {
      toast.error('Ethereum wallet not connected', {
        description: `Please connect an Ethereum wallet to ${action}.`,
      });
      return false;
    }
    return true;
  };

  const requireSolana = (action: string = 'perform this action') => {
    if (!wallet.solana.isConnected) {
      toast.error('Solana wallet not connected', {
        description: `Please connect a Solana wallet to ${action}.`,
      });
      return false;
    }
    return true;
  };

  const requireWallet = (action: string = 'perform this action') => {
    return requireConnection(action);
  };

  return {
    address: wallet.address,
    isConnected: wallet.isConnected,
    primaryChain: wallet.primaryChain,
    ethereum: wallet.ethereum,
    solana: {
      address: wallet.solana.address,
      isConnected: wallet.solana.isConnected,
      balance: wallet.solana.balance?.toString(),
    },
    requireConnection,
    requireEthereum,
    requireSolana,
    requireWallet,
    connectWallet: wallet.connectWallet,
    disconnectWallet: wallet.disconnectWallet,
  };
}
