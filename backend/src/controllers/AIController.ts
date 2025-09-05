import { Request, Response } from 'express';
import { AIService } from '@/services/AIService';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate AI content
   */
  generateContent = async (req: Request, res: Response): Promise<void> => {
    const { prompt, model, userAddress, maxTokens, temperature } = req.body;

    try {
      const result = await this.aiService.generateContent({
        prompt,
        model,
        userAddress,
        maxTokens: maxTokens || 1000,
        temperature: temperature || 0.7,
      });

      logger.info('AI content generated successfully', {
        requestId: result.requestId,
        model,
        userAddress,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to generate AI content', {
        error: error instanceof Error ? error.message : 'Unknown error',
        prompt: prompt.substring(0, 100),
        model,
        userAddress,
      });

      throw createError.internal('Failed to generate AI content');
    }
  };

  /**
   * Get available AI models
   */
  getModels = async (req: Request, res: Response): Promise<void> => {
    try {
      const models = await this.aiService.getAvailableModels();

      res.status(200).json({
        success: true,
        data: {
          models,
          total: models.length,
        },
      });
    } catch (error) {
      logger.error('Failed to fetch AI models', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw createError.internal('Failed to fetch available models');
    }
  };

  /**
   * Get generation status and result
   */
  getGeneration = async (req: Request, res: Response): Promise<void> => {
    const { requestId } = req.params;

    try {
      const generation = await this.aiService.getGeneration(requestId);

      if (!generation) {
        throw createError.notFound('Generation not found');
      }

      res.status(200).json({
        success: true,
        data: generation,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }

      logger.error('Failed to fetch generation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      });

      throw createError.internal('Failed to fetch generation');
    }
  };

  /**
   * Validate AI output against expected hash
   */
  validateOutput = async (req: Request, res: Response): Promise<void> => {
    const { prompt, output, model, expectedHash } = req.body;

    try {
      const isValid = await this.aiService.validateOutput({
        prompt,
        output,
        model,
        expectedHash,
      });

      res.status(200).json({
        success: true,
        data: {
          valid: isValid,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Failed to validate AI output', {
        error: error instanceof Error ? error.message : 'Unknown error',
        model,
        expectedHash,
      });

      throw createError.internal('Failed to validate output');
    }
  };

  /**
   * Get user's generation history
   */
  getUserGenerations = async (req: Request, res: Response): Promise<void> => {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    try {
      const result = await this.aiService.getUserGenerations(
        address,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Failed to fetch user generations', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address,
        page,
        limit,
      });

      throw createError.internal('Failed to fetch user generations');
    }
  };
}
