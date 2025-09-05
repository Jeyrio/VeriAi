import mongoose, { Schema, Document } from 'mongoose';

// AI Generation Model
export interface IAIGeneration extends Document {
  requestId: string;
  prompt: string;
  output: string;
  aiModel: string;
  userAddress: string;
  outputHash: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AIGenerationSchema = new Schema<IAIGeneration>({
  requestId: { type: String, required: true, unique: true, index: true },
  prompt: { type: String, required: true },
  output: { type: String, default: '' },
  aiModel: { type: String, required: true, index: true },
  userAddress: { type: String, required: true, index: true },
  outputHash: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending',
    index: true 
  },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes for performance
AIGenerationSchema.index({ userAddress: 1, createdAt: -1 });
AIGenerationSchema.index({ status: 1, createdAt: -1 });
AIGenerationSchema.index({ aiModel: 1, createdAt: -1 });

export const AIGeneration = mongoose.model<IAIGeneration>('AIGeneration', AIGenerationSchema);

// Verification Model
export interface IVerification extends Document {
  verificationId: string;
  prompt: string;
  output: string;
  aiModel: string;
  outputHash: string;
  userAddress: string;
  signature: string;
  status: 'pending' | 'verified' | 'challenged' | 'rejected';
  timestamp: Date;
  verifiedAt?: Date;
  attestationId?: string;
  fdcProof?: any;
  challenges?: string[]; // References to Challenge documents
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>({
  verificationId: { type: String, required: true, unique: true },
  prompt: { type: String, required: true },
  output: { type: String, required: true },
  aiModel: { type: String, required: true },
  outputHash: { type: String, required: true },
  userAddress: { type: String, required: true },
  signature: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'challenged', 'rejected'], 
    default: 'pending'
  },
  timestamp: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  attestationId: { type: String },
  fdcProof: { type: Schema.Types.Mixed },
  challenges: [{ type: Schema.Types.ObjectId, ref: 'Challenge' }],
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes for performance
VerificationSchema.index({ userAddress: 1, createdAt: -1 });
VerificationSchema.index({ status: 1, createdAt: -1 });
VerificationSchema.index({ attestationId: 1 });
VerificationSchema.index({ outputHash: 1 });

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);

// Challenge Model
export interface IChallenge extends Document {
  verificationId: mongoose.Types.ObjectId;
  challengerAddress: string;
  reason: string;
  evidence: any;
  status: 'pending' | 'resolved' | 'upheld';
  timestamp: Date;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>({
  verificationId: { type: Schema.Types.ObjectId, ref: 'Verification', required: true, index: true },
  challengerAddress: { type: String, required: true, index: true },
  reason: { type: String, required: true },
  evidence: { type: Schema.Types.Mixed, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'resolved', 'upheld'], 
    default: 'pending',
    index: true 
  },
  timestamp: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes for performance
ChallengeSchema.index({ verificationId: 1, createdAt: -1 });
ChallengeSchema.index({ challengerAddress: 1, createdAt: -1 });
ChallengeSchema.index({ status: 1, createdAt: -1 });

export const Challenge = mongoose.model<IChallenge>('Challenge', ChallengeSchema);

// NFT Model
export interface INFT extends Document {
  tokenId: string;
  owner: string;
  prompt: string;
  output: string;
  aiModel: string;
  verificationId: mongoose.Types.ObjectId;
  metadataURI: string;
  timestamp: Date;
  transactionHash?: string;
  blockNumber?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NFTSchema = new Schema<INFT>({
  tokenId: { type: String, required: true, unique: true, index: true },
  owner: { type: String, required: true },
  prompt: { type: String, required: true },
  output: { type: String, required: true },
  aiModel: { type: String, required: true },
  verificationId: { type: Schema.Types.ObjectId, ref: 'Verification', required: true },
  metadataURI: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  transactionHash: { type: String },
  blockNumber: { type: Number },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes for performance
NFTSchema.index({ owner: 1, createdAt: -1 });
NFTSchema.index({ verificationId: 1 });
NFTSchema.index({ aiModel: 1, createdAt: -1 });
NFTSchema.index({ transactionHash: 1 });

export const NFT = mongoose.model<INFT>('NFT', NFTSchema);

// User Stats Model (for caching)
export interface IUserStats extends Document {
  userAddress: string;
  totalGenerations: number;
  totalVerifications: number;
  totalNFTs: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema = new Schema<IUserStats>({
  userAddress: { type: String, required: true, unique: true, index: true },
  totalGenerations: { type: Number, default: 0 },
  totalVerifications: { type: Number, default: 0 },
  totalNFTs: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const UserStats = mongoose.model<IUserStats>('UserStats', UserStatsSchema);

// User Model (for authentication)
export interface IUser extends Document {
  address: string;
  nonce: string;
  createdAt: Date;
  lastLoginAt: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  address: { type: String, required: true, unique: true, index: true },
  nonce: { type: String, required: true },
  lastLoginAt: { type: Date },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ address: 1 });
UserSchema.index({ lastActivity: -1 });
UserSchema.index({ isActive: 1, lastActivity: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
