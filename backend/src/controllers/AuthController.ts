import { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { logger } from '@/utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  generateNonce = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userAddress } = req.params;

      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User address is required',
          },
        });
        return;
      }

      const result = await this.authService.generateNonce(userAddress);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Generate nonce failed', {
        userAddress: req.params.userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate nonce',
        },
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { address, signature, message } = req.body;

      if (!address || !signature || !message) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Address, signature, and message are required',
          },
        });
        return;
      }

      const result = await this.authService.authenticateUser(address, signature, message);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Login failed', {
        address: req.body.address,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: error instanceof Error ? error.message : 'Authentication failed',
        },
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // For wallet-based auth, logout is primarily client-side
      // We can optionally invalidate tokens on server side in the future
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to logout',
        },
      });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userAddress } = req.params;

      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User address is required',
          },
        });
        return;
      }

      const profile = await this.authService.getUserProfile(userAddress);

      if (!profile) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          address: profile.address,
          createdAt: profile.createdAt.toISOString(),
          lastLoginAt: profile.lastLoginAt?.toISOString(),
          lastActivity: profile.lastActivity?.toISOString(),
          stats: {
            totalGenerations: profile.totalGenerations,
            totalVerifications: profile.totalVerifications,
            totalNFTs: profile.totalNFTs,
          },
        },
      });
    } catch (error) {
      logger.error('Get profile failed', {
        userAddress: req.params.userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve user profile',
        },
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Bearer token required',
          },
        });
        return;
      }

      const token = authHeader.substring(7);
      const result = await this.authService.refreshToken(token);

      if (!result) {
        res.status(401).json({
          success: false,
          error: {
            code: 'TOKEN_REFRESH_FAILED',
            message: 'Failed to refresh token',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to refresh token',
        },
      });
    }
  };

  verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token is required',
          },
        });
        return;
      }

      const result = await this.authService.verifyJWT(token);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify token',
        },
      });
    }
  };
}