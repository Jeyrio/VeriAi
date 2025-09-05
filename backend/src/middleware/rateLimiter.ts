import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// Simple in-memory rate limiter (for development)
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  public consume(key: string): { allowed: boolean; remainingPoints: number; msBeforeNext: number } {
    const now = Date.now();
    const userData = this.requests.get(key);

    if (!userData || now > userData.resetTime) {
      // First request or window expired
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return {
        allowed: true,
        remainingPoints: this.maxRequests - 1,
        msBeforeNext: 0
      };
    }

    if (userData.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remainingPoints: 0,
        msBeforeNext: userData.resetTime - now
      };
    }

    // Increment counter
    userData.count++;
    this.requests.set(key, userData);

    return {
      allowed: true,
      remainingPoints: this.maxRequests - userData.count,
      msBeforeNext: 0
    };
  }
}

// Rate limiter instance
const rateLimiter = new InMemoryRateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
);

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Use IP address as the key
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    const result = rateLimiter.consume(key);
    
    if (!result.allowed) {
      logger.warn(`Rate limit exceeded for IP: ${key}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });

      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          details: {
            remainingPoints: result.remainingPoints,
            msBeforeNext: result.msBeforeNext,
            retryAfter: Math.ceil(result.msBeforeNext / 1000),
          },
        },
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Rate limiter error:', error);
    next(); // Continue if rate limiter fails
  }
};

// Export for use in main app
export { rateLimiterMiddleware as rateLimiter };
