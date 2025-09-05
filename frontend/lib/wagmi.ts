// VeriAI Web3Auth Configuration
// This file is kept for compatibility but Web3Auth handles chain configuration internally
import { APP_CONFIG } from './config';

// Ethereum configuration for Web3Auth
export const ethereumConfig = {
  chainId: APP_CONFIG.ethereum.chainId,
  name: APP_CONFIG.ethereum.name,
  rpcUrl: APP_CONFIG.ethereum.rpcUrl,
  explorerUrl: APP_CONFIG.ethereum.explorerUrl,
  nativeCurrency: APP_CONFIG.ethereum.nativeCurrency,
};

// Solana configuration for Web3Auth  
export const solanaConfig = {
  network: APP_CONFIG.solana.network,
  rpcUrl: APP_CONFIG.solana.rpcUrl,
  explorerUrl: APP_CONFIG.solana.explorerUrl,
  nativeCurrency: APP_CONFIG.solana.nativeCurrency,
};

// Export for backward compatibility
export const config = {
  ethereum: ethereumConfig,
  solana: solanaConfig,
};
