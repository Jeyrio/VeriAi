export interface VerificationRequest {
  requester: string;
  prompt: string;
  model: string;
  timestamp: number;
  status: VerificationStatus;
  outputHash: string;
  attestationId: string;
  feePaid: string;
  nftMinted: boolean;
}

export interface UserStats {
  totalRequests: number;
  successfulVerifications: number;
  failedVerifications: number;
  pendingRequests: number;
  lastRequestTime: number;
  isRateLimited: boolean;
}

export interface ContractStats {
  totalRequests: number;
  totalVerified: number;
  totalFailed: number;
  totalFeesCollected: string;
  activeOracles: number;
  isPaused: boolean;
}

export enum VerificationStatus {
  Pending = 0,
  Verified = 1,
  Failed = 2,
  Expired = 3
}