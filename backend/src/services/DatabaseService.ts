import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '@/utils/logger';
import {
  AIGeneration,
  IAIGeneration,
  Verification,
  IVerification,
  Challenge,
  IChallenge,
  NFT,
  INFT,
  UserStats,
  IUserStats,
  User,
  IUser
} from '@/models';

// Database interfaces
interface AIGenerationData {
  id: string;
  requestId: string;
  prompt: string;
  output: string;
  model: string;
  userAddress: string;
  outputHash: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

interface VerificationData {
  id: string;
  prompt: string;
  output: string;
  model: string;
  outputHash: string;
  userAddress: string;
  signature: string;
  status: 'pending' | 'verified' | 'challenged' | 'rejected';
  timestamp: string;
  verifiedAt?: string;
  attestationId?: string;
  fdcProof?: any;
  challenges?: ChallengeData[];
  metadata?: Record<string, any>;
}

interface ChallengeData {
  id: string;
  verificationId: string;
  challengerAddress: string;
  reason: string;
  evidence: any;
  status: 'pending' | 'resolved' | 'upheld';
  timestamp: string;
  resolvedAt?: string;
}

interface NFTData {
  tokenId: string;
  owner: string;
  prompt: string;
  output: string;
  model: string;
  verificationId: string;
  metadataURI: string;
  timestamp: string;
}

export class DatabaseService {
  private isConnected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    // Load environment variables
    dotenv.config();
    // Don't connect immediately, wait for first use
  }

  /**
   * Ensure database connection
   */
  private async ensureConnection(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.connectionPromise = this.connect();
    return this.connectionPromise;
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is required');
      }
      
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      logger.info('Connected to MongoDB', { uri: mongoUri.replace(/\/\/.*@/, '//***@') });

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', { error: error.message });
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.isConnected = false;
    }
  }

  /**
   * Update user statistics
   */
  private async updateUserStats(userAddress: string, action: 'generation' | 'verification' | 'nft'): Promise<void> {
    try {
      const update: any = { lastActivity: new Date() };
      
      if (action === 'generation') update.$inc = { totalGenerations: 1 };
      if (action === 'verification') update.$inc = { totalVerifications: 1 };
      if (action === 'nft') update.$inc = { totalNFTs: 1 };

      await UserStats.findOneAndUpdate(
        { userAddress },
        update,
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error('Failed to update user stats', { userAddress, action });
    }
  }

  // AI Generation methods
  async saveGeneration(generation: AIGenerationData): Promise<void> {
    await this.ensureConnection();
    try {
      const doc = new AIGeneration({
        requestId: generation.requestId,
        prompt: generation.prompt,
        output: generation.output,
        aiModel: generation.model,
        userAddress: generation.userAddress,
        outputHash: generation.outputHash,
        timestamp: new Date(generation.timestamp),
        status: generation.status,
        metadata: generation.metadata,
      });

      await doc.save();
      await this.updateUserStats(generation.userAddress, 'generation');
      
      logger.debug('Generation saved', { generationId: generation.id });
    } catch (error) {
      logger.error('Failed to save generation', {
        generationId: generation.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateGeneration(id: string, updates: Partial<AIGenerationData>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.output !== undefined) updateData.output = updates.output;
      if (updates.outputHash !== undefined) updateData.outputHash = updates.outputHash;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      await AIGeneration.findOneAndUpdate(
        { requestId: id },
        { $set: updateData },
        { new: true }
      );

      logger.debug('Generation updated', { generationId: id });
    } catch (error) {
      logger.error('Failed to update generation', {
        generationId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getGeneration(id: string): Promise<AIGenerationData | null> {
    try {
      const doc = await AIGeneration.findOne({ requestId: id });
      if (!doc) return null;

      return {
        id: doc.requestId,
        requestId: doc.requestId,
        prompt: doc.prompt,
        output: doc.output,
        model: doc.aiModel,
        userAddress: doc.userAddress,
        outputHash: doc.outputHash,
        timestamp: doc.timestamp.toISOString(),
        createdAt: doc.timestamp.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        status: doc.status,
        metadata: doc.metadata,
      };
    } catch (error) {
      logger.error('Failed to get generation', {
        generationId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async getUserGenerations(
    userAddress: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    generations: AIGenerationData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [docs, total] = await Promise.all([
        AIGeneration.find({ userAddress })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AIGeneration.countDocuments({ userAddress })
      ]);

      const generations = docs.map(doc => ({
        id: doc.requestId,
        requestId: doc.requestId,
        prompt: doc.prompt,
        output: doc.output,
        model: doc.aiModel,
        userAddress: doc.userAddress,
        outputHash: doc.outputHash,
        timestamp: doc.timestamp.toISOString(),
        createdAt: doc.timestamp.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        status: doc.status,
        metadata: doc.metadata,
      }));

      return {
        generations,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Failed to get user generations', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        generations: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  async getGenerationStats(): Promise<{
    totalGenerations: number;
    totalUsers: number;
    modelUsage: Record<string, number>;
    successRate: number;
  }> {
    try {
      const [totalGenerations, totalUsers, modelUsage, successfulCount] = await Promise.all([
        AIGeneration.countDocuments(),
        AIGeneration.distinct('userAddress').then(users => users.length),
        AIGeneration.aggregate([
          { $group: { _id: '$model', count: { $sum: 1 } } }
        ]),
        AIGeneration.countDocuments({ status: 'completed' })
      ]);

      const modelUsageMap: Record<string, number> = {};
      modelUsage.forEach(item => {
        modelUsageMap[item._id] = item.count;
      });

      return {
        totalGenerations,
        totalUsers,
        modelUsage: modelUsageMap,
        successRate: totalGenerations > 0 ? successfulCount / totalGenerations : 0,
      };
    } catch (error) {
      logger.error('Failed to get generation stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        totalGenerations: 0,
        totalUsers: 0,
        modelUsage: {},
        successRate: 0,
      };
    }
  }

  // Verification methods
  async saveVerification(verification: VerificationData): Promise<void> {
    try {
      const doc = new Verification({
        verificationId: verification.id,
        prompt: verification.prompt,
        output: verification.output,
        aiModel: verification.model,
        outputHash: verification.outputHash,
        userAddress: verification.userAddress,
        signature: verification.signature,
        status: verification.status,
        timestamp: new Date(verification.timestamp),
        verifiedAt: verification.verifiedAt ? new Date(verification.verifiedAt) : undefined,
        attestationId: verification.attestationId,
        fdcProof: verification.fdcProof,
        metadata: verification.metadata,
      });

      await doc.save();
      await this.updateUserStats(verification.userAddress, 'verification');
      
      logger.debug('Verification saved', { verificationId: verification.id });
    } catch (error) {
      logger.error('Failed to save verification', {
        verificationId: verification.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateVerification(id: string, updates: Partial<VerificationData>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.verifiedAt !== undefined) updateData.verifiedAt = new Date(updates.verifiedAt);
      if (updates.attestationId !== undefined) updateData.attestationId = updates.attestationId;
      if (updates.fdcProof !== undefined) updateData.fdcProof = updates.fdcProof;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      await Verification.findOneAndUpdate({ verificationId: id }, { $set: updateData }, { new: true });
      
      logger.debug('Verification updated', { verificationId: id });
    } catch (error) {
      logger.error('Failed to update verification', {
        verificationId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getVerification(id: string): Promise<VerificationData | null> {
    try {
      const doc = await Verification.findOne({ verificationId: id }).populate('challenges');
      if (!doc) return null;

      return {
        id: doc.verificationId,
        prompt: doc.prompt,
        output: doc.output,
        model: doc.aiModel,
        outputHash: doc.outputHash,
        userAddress: doc.userAddress,
        signature: doc.signature,
        status: doc.status,
        timestamp: doc.timestamp.toISOString(),
        verifiedAt: doc.verifiedAt?.toISOString(),
        attestationId: doc.attestationId,
        fdcProof: doc.fdcProof,
        metadata: doc.metadata,
      };
    } catch (error) {
      logger.error('Failed to get verification', {
        verificationId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async getUserVerifications(
    userAddress: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{
    verifications: VerificationData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const filter: any = { userAddress };
      
      if (status) {
        filter.status = status;
      }
      
      const [docs, total] = await Promise.all([
        Verification.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Verification.countDocuments(filter)
      ]);

      const verifications = docs.map(doc => ({
        id: doc.verificationId,
        prompt: doc.prompt,
        output: doc.output,
        model: doc.aiModel,
        outputHash: doc.outputHash,
        userAddress: doc.userAddress,
        signature: doc.signature,
        status: doc.status,
        timestamp: doc.timestamp.toISOString(),
        verifiedAt: doc.verifiedAt?.toISOString(),
        attestationId: doc.attestationId,
        fdcProof: doc.fdcProof,
        metadata: doc.metadata,
      }));

      return {
        verifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Failed to get user verifications', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        verifications: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  async getVerificationStats(): Promise<{
    totalVerifications: number;
    verifiedCount: number;
    challengedCount: number;
    rejectedCount: number;
    successRate: number;
  }> {
    try {
      const [totalVerifications, verifiedCount, challengedCount, rejectedCount] = await Promise.all([
        Verification.countDocuments(),
        Verification.countDocuments({ status: 'verified' }),
        Verification.countDocuments({ status: 'challenged' }),
        Verification.countDocuments({ status: 'rejected' })
      ]);

      return {
        totalVerifications,
        verifiedCount,
        challengedCount,
        rejectedCount,
        successRate: totalVerifications > 0 ? verifiedCount / totalVerifications : 0,
      };
    } catch (error) {
      logger.error('Failed to get verification stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        totalVerifications: 0,
        verifiedCount: 0,
        challengedCount: 0,
        rejectedCount: 0,
        successRate: 0,
      };
    }
  }

  // Challenge methods
  async saveChallenge(challenge: ChallengeData): Promise<void> {
    try {
      const doc = new Challenge({
        verificationId: challenge.verificationId,
        challengerAddress: challenge.challengerAddress,
        reason: challenge.reason,
        evidence: challenge.evidence,
        status: challenge.status,
        timestamp: new Date(challenge.timestamp),
        resolvedAt: challenge.resolvedAt ? new Date(challenge.resolvedAt) : undefined,
      });

      const savedChallenge = await doc.save();

      // Update verification with challenge reference
      await Verification.findByIdAndUpdate(
        challenge.verificationId,
        { $push: { challenges: savedChallenge._id } }
      );
      
      logger.debug('Challenge saved', { challengeId: challenge.id });
    } catch (error) {
      logger.error('Failed to save challenge', {
        challengeId: challenge.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async updateChallenge(id: string, updates: Partial<ChallengeData>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.resolvedAt !== undefined) updateData.resolvedAt = new Date(updates.resolvedAt);

      await Challenge.findByIdAndUpdate(id, { $set: updateData }, { new: true });
      
      logger.debug('Challenge updated', { challengeId: id });
    } catch (error) {
      logger.error('Failed to update challenge', {
        challengeId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getChallenge(id: string): Promise<ChallengeData | null> {
    try {
      const doc = await Challenge.findById(id);
      if (!doc) return null;

      return {
        id: (doc as any)._id.toString(),
        verificationId: doc.verificationId.toString(),
        challengerAddress: doc.challengerAddress,
        reason: doc.reason,
        evidence: doc.evidence,
        status: doc.status,
        timestamp: doc.timestamp.toISOString(),
        resolvedAt: doc.resolvedAt?.toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get challenge', {
        challengeId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  // NFT methods
  async saveNFT(nft: NFTData): Promise<void> {
    try {
      const doc = new NFT({
        tokenId: nft.tokenId,
        owner: nft.owner,
        prompt: nft.prompt,
        output: nft.output,
        aiModel: nft.model,
        verificationId: nft.verificationId,
        metadataURI: nft.metadataURI,
        timestamp: new Date(nft.timestamp),
      });

      await doc.save();
      await this.updateUserStats(nft.owner, 'nft');
      
      logger.debug('NFT saved', { tokenId: nft.tokenId });
    } catch (error) {
      logger.error('Failed to save NFT', {
        tokenId: nft.tokenId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getNFT(tokenId: string): Promise<NFTData | null> {
    try {
      const doc = await NFT.findOne({ tokenId });
      if (!doc) return null;

      return {
        tokenId: doc.tokenId,
        owner: doc.owner,
        prompt: doc.prompt,
        output: doc.output,
        model: doc.aiModel,
        verificationId: doc.verificationId.toString(),
        metadataURI: doc.metadataURI,
        timestamp: doc.timestamp.toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get NFT', {
        tokenId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async getUserNFTs(
    userAddress: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    nfts: NFTData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [docs, total] = await Promise.all([
        NFT.find({ owner: userAddress })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        NFT.countDocuments({ owner: userAddress })
      ]);

      const nfts = docs.map(doc => ({
        tokenId: doc.tokenId,
        owner: doc.owner,
        prompt: doc.prompt,
        output: doc.output,
        model: doc.aiModel,
        verificationId: doc.verificationId.toString(),
        metadataURI: doc.metadataURI,
        timestamp: doc.timestamp.toISOString(),
      }));

      return {
        nfts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Failed to get user NFTs', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        nfts: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  // Contract stats
  async getContractStats(): Promise<{
    totalUsers: number;
    totalGenerations: number;
    totalVerifications: number;
    totalNFTs: number;
  }> {
    try {
      const [stats] = await Promise.all([
        UserStats.aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              totalGenerations: { $sum: '$totalGenerations' },
              totalVerifications: { $sum: '$totalVerifications' },
              totalNFTs: { $sum: '$totalNFTs' }
            }
          }
        ])
      ]);

      return stats.length > 0 ? stats[0] : {
        totalUsers: 0,
        totalGenerations: 0,
        totalVerifications: 0,
        totalNFTs: 0,
      };
    } catch (error) {
      logger.error('Failed to get contract stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        totalUsers: 0,
        totalGenerations: 0,
        totalVerifications: 0,
        totalNFTs: 0,
      };
    }
  }

  // User management methods
  async upsertUser(userData: {
    address: string;
    nonce: string;
    lastActivity?: Date;
  }): Promise<IUser> {
    await this.ensureConnection();
    try {
      const doc = await User.findOneAndUpdate(
        { address: userData.address },
        {
          $set: {
            nonce: userData.nonce,
            lastActivity: userData.lastActivity || new Date(),
          },
        },
        { upsert: true, new: true }
      );

      logger.debug('User upserted', { address: userData.address });
      return doc;
    } catch (error) {
      logger.error('Failed to upsert user', {
        address: userData.address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getUser(address: string): Promise<IUser | null> {
    await this.ensureConnection();
    try {
      const user = await User.findOne({ address });
      return user;
    } catch (error) {
      logger.error('Failed to get user', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async updateUser(address: string, updates: Partial<{
    nonce: string;
    lastLoginAt: Date;
    lastActivity: Date;
    isActive: boolean;
    metadata: Record<string, any>;
  }>): Promise<IUser | null> {
    await this.ensureConnection();
    try {
      const user = await User.findOneAndUpdate(
        { address },
        { $set: updates },
        { new: true }
      );

      logger.debug('User updated', { address });
      return user;
    } catch (error) {
      logger.error('Failed to update user', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async countUserGenerations(userAddress: string): Promise<number> {
    await this.ensureConnection();
    try {
      return await AIGeneration.countDocuments({ userAddress });
    } catch (error) {
      logger.error('Failed to count user generations', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  async countUserVerifications(userAddress: string): Promise<number> {
    await this.ensureConnection();
    try {
      return await Verification.countDocuments({ userAddress });
    } catch (error) {
      logger.error('Failed to count user verifications', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  async countUserNFTs(userAddress: string): Promise<number> {
    await this.ensureConnection();
    try {
      return await NFT.countDocuments({ owner: userAddress });
    } catch (error) {
      logger.error('Failed to count user NFTs', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  // Utility methods
  async clear(): Promise<void> {
    try {
      await Promise.all([
        AIGeneration.deleteMany({}),
        Verification.deleteMany({}),
        Challenge.deleteMany({}),
        NFT.deleteMany({}),
        UserStats.deleteMany({}),
        User.deleteMany({})
      ]);
      
      logger.info('Database cleared');
    } catch (error) {
      logger.error('Failed to clear database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getHealthCheck(): Promise<{
    status: 'healthy' | 'error';
    connections: number;
    uptime: number;
  }> {
    try {
      return {
        status: this.isConnected ? 'healthy' : 'error',
        connections: mongoose.connection.readyState,
        uptime: process.uptime(),
      };
    } catch (error) {
      return {
        status: 'error',
        connections: 0,
        uptime: process.uptime(),
      };
    }
  }
}
