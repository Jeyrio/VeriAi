import { Address } from 'viem';

// Core Types
export interface VerificationRequest {
  id: string;
  requestId: string;
  prompt: string;
  output: string;
  model: string;
  userAddress: Address;
  outputHash: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface VerificationData {
  id: string;
  prompt: string;
  output: string;
  model: string;
  outputHash: string;
  userAddress: Address;
  signature: string;
  status: 'pending' | 'verified' | 'challenged' | 'rejected';
  timestamp: string;
  verifiedAt?: string;
  attestationId?: string;
  fdcProof?: any;
  challenges?: ChallengeData[];
  metadata?: Record<string, any>;
}

export interface ChallengeData {
  id: string;
  verificationId: string;
  challengerAddress: Address;
  reason: string;
  evidence: any;
  status: 'pending' | 'resolved' | 'upheld';
  timestamp: string;
  resolvedAt?: string;
}

export interface NFTData {
  tokenId: string;
  owner: Address;
  prompt: string;
  output: string;
  model: string;
  verificationId: string;
  metadataURI: string;
  timestamp: string;
  transactionHash?: string;
  blockNumber?: number;
}

export interface VerificationMetadata {
  prompt: string;
  model: string;
  outputHash: string;
  timestamp: number;
  proofHash: string;
  verified: boolean;
  verifier: Address;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Contract Event Types
export interface VerificationRequestedEvent {
  requestId: string;
  requester: Address;
  prompt: string;
  model: string;
  fee: bigint;
}

export interface VerificationFulfilledEvent {
  requestId: string;
  attestationId: string;
  outputHash: string;
}

export interface VerificationFailedEvent {
  requestId: string;
  reason: string;
}

export interface NFTMintedEvent {
  tokenId: string;
  recipient: Address;
  model: string;
  verified: boolean;
}

// UI State Types
export interface VerificationFormData {
  prompt: string;
  model: string;
}

export interface UserStats {
  totalGenerations: number;
  totalVerifications: number;
  totalNFTs: number;
  lastActivity: string;
}

export interface CollectionFilters {
  model?: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
}

export interface SortOptions {
  field: 'timestamp' | 'model' | 'status';
  direction: 'asc' | 'desc';
}

// Analytics Types
export interface AnalyticsData {
  verificationStats: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
  };
  modelUsage: {
    model: string;
    count: number;
    percentage: number;
  }[];
  dailyActivity: {
    date: string;
    verifications: number;
    nfts: number;
  }[];
  recentActivity: VerificationData[];
}

// Web3 Types
export interface WalletState {
  isConnected: boolean;
  address?: Address;
  chainId?: number;
  isCorrectChain: boolean;
}

export interface TransactionState {
  hash?: string;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// Form Types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface FormState<T> {
  fields: T;
  isValid: boolean;
  isSubmitting: boolean;
  submitError?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Export utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
