import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { DatabaseService } from './DatabaseService';
import { logger } from '@/utils/logger';

interface User {
  address: string;
  nonce: string;
  createdAt: Date;
  lastLoginAt?: Date;
  lastActivity: Date;
  totalGenerations: number;
  totalVerifications: number;
  totalNFTs: number;
}

interface AuthResult {
  token: string;
  user: {
    address: string;
    authenticated: boolean;
    totalGenerations: number;
    totalVerifications: number;
    totalNFTs: number;
  };
}

export class AuthService {
  private db: DatabaseService;
  private jwtSecret: string;
  private jwtExpiry: string;

  constructor() {
    this.db = new DatabaseService();
    this.jwtSecret = process.env.JWT_SECRET || 'veriai-secret-key';
    this.jwtExpiry = process.env.JWT_EXPIRY || '7d';
  }

  async generateNonce(userAddress: string): Promise<{ nonce: string; message: string }> {
    try {
      const nonce = crypto.randomBytes(16).toString('hex');
      const message = `Sign this message to authenticate with VeriAI:\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

      await this.db.upsertUser({
        address: userAddress.toLowerCase(),
        nonce,
        lastActivity: new Date(),
      });

      logger.info('Generated nonce for user', { userAddress, nonce });

      return { nonce, message };
    } catch (error) {
      logger.error('Failed to generate nonce', { userAddress, error });
      throw new Error('Failed to generate authentication nonce');
    }
  }

  async verifySignature(
    userAddress: string,
    signature: string,
    message: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      const isValid = recoveredAddress.toLowerCase() === userAddress.toLowerCase();
      
      logger.info('Signature verification result', {
        userAddress,
        recoveredAddress,
        isValid,
      });

      return isValid;
    } catch (error) {
      logger.error('Signature verification failed', { userAddress, error });
      return false;
    }
  }

  async authenticateUser(
    userAddress: string,
    signature: string,
    message: string
  ): Promise<AuthResult> {
    try {
      const user = await this.db.getUser(userAddress.toLowerCase());
      if (!user) {
        throw new Error('User not found. Please generate a nonce first.');
      }

      if (!message.includes(user.nonce)) {
        throw new Error('Invalid nonce in message');
      }

      const isValidSignature = await this.verifySignature(userAddress, signature, message);
      if (!isValidSignature) {
        throw new Error('Invalid signature');
      }

      await this.db.updateUser(userAddress.toLowerCase(), {
        lastLoginAt: new Date(),
        nonce: crypto.randomBytes(16).toString('hex'), // Generate new nonce
      });

      const token = this.generateJWT(userAddress);

      const userStats = await this.getUserStats(userAddress);

      logger.info('User authenticated successfully', { userAddress });

      return {
        token,
        user: {
          address: userAddress,
          authenticated: true,
          ...userStats,
        },
      };
    } catch (error) {
      logger.error('Authentication failed', { userAddress, error });
      throw error;
    }
  }

  private generateJWT(userAddress: string): string {
    const payload = {
      address: userAddress.toLowerCase(),
      type: 'wallet',
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
      issuer: 'veriai',
      audience: 'veriai-users',
    } as jwt.SignOptions);
  }

  async verifyJWT(token: string): Promise<{ address: string; valid: boolean }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        address: decoded.address,
        valid: true,
      };
    } catch (error) {
      logger.error('JWT verification failed', { error });
      return {
        address: '',
        valid: false,
      };
    }
  }

  async getUserProfile(userAddress: string): Promise<User | null> {
    try {
      const user = await this.db.getUser(userAddress.toLowerCase());
      if (!user) {
        return null;
      }

      const stats = await this.getUserStats(userAddress);
      
      return {
        ...user,
        ...stats,
      };
    } catch (error) {
      logger.error('Failed to get user profile', { userAddress, error });
      throw new Error('Failed to retrieve user profile');
    }
  }

  private async getUserStats(userAddress: string): Promise<{
    totalGenerations: number;
    totalVerifications: number;
    totalNFTs: number;
  }> {
    try {
      const [generationsCount, verificationsCount, nftsCount] = await Promise.all([
        this.db.countUserGenerations(userAddress.toLowerCase()),
        this.db.countUserVerifications(userAddress.toLowerCase()),
        this.db.countUserNFTs(userAddress.toLowerCase()),
      ]);

      return {
        totalGenerations: generationsCount,
        totalVerifications: verificationsCount,
        totalNFTs: nftsCount,
      };
    } catch (error) {
      logger.error('Failed to get user stats', { userAddress, error });
      return {
        totalGenerations: 0,
        totalVerifications: 0,
        totalNFTs: 0,
      };
    }
  }

  async refreshToken(oldToken: string): Promise<{ token: string } | null> {
    try {
      const decoded = jwt.verify(oldToken, this.jwtSecret) as any;
      const newToken = this.generateJWT(decoded.address);
      
      logger.info('Token refreshed successfully', { address: decoded.address });
      
      return { token: newToken };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      return null;
    }
  }

  async updateUserActivity(userAddress: string): Promise<void> {
    try {
      await this.db.updateUser(userAddress.toLowerCase(), {
        lastActivity: new Date(),
      });
    } catch (error) {
      logger.error('Failed to update user activity', { userAddress, error });
    }
  }
}