export const APP_CONFIG = {
  name: 'VeriAI',
  description: 'On-Chain Verification for AI-Generated Content',
  url: 'https://veriai.app',
  version: '1.0.0',
  
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 30000,
  },
  
  // Web3Auth Configuration
  web3auth: {
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '',
  },
  
  // Blockchain Configuration
  blockchain: {
    explorerUrl: 'https://sepolia.etherscan.io', // Default to Ethereum
  },
  
  ethereum: {
    chainId: 11155111, // Sepolia testnet
    name: 'Ethereum Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/your-key',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  
  solana: {
    network: 'devnet',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
  },
  
  // Smart Contract Configuration
  contracts: {
    ethereum: {
      veriAI: process.env.NEXT_PUBLIC_VERI_AI_ETH_CONTRACT_ADDRESS || '0x7F158983dE8dF048045002AD6838572DF09a6591',
      veriAINFT: process.env.NEXT_PUBLIC_VERI_AI_NFT_ETH_CONTRACT_ADDRESS || '0x8AcEfA0b05D87c7a9b09F9a8F1A05dB5E8129332',
    },
    solana: {
      veriAI: process.env.NEXT_PUBLIC_VERI_AI_SOL_PROGRAM_ID || '',
      veriAINFT: process.env.NEXT_PUBLIC_VERI_AI_NFT_SOL_PROGRAM_ID || '',
    },
  },
  
  // AI Models
  models: {
    gemini: 'gemini-1.5-flash',
    openai: 'gpt-3.5-turbo',
    claude: 'claude-3-haiku',
  },
  
  // UI Configuration
  ui: {
    maxPromptLength: 2000,
    maxOutputDisplay: 1000,
    animationDuration: 300,
    pollingInterval: 2000,
  },
  
  // Feature Flags
  features: {
    analytics: true,
    notifications: true,
    darkMode: true,
    batching: true,
  },
} as const;

export const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  VERIFIED: 'verified',
  CHALLENGED: 'challenged',
  REJECTED: 'rejected',
} as const;

export const AI_MODELS = [
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'Groq' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'Groq' },
] as const;
