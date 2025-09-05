import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validation';
import { AIController } from '@/controllers/AIController';

const router = Router();

// Lazy initialization to ensure environment variables are loaded
const getAIController = (): AIController => {
  if (!(getAIController as any)._instance) {
    (getAIController as any)._instance = new AIController();
  }
  return (getAIController as any)._instance;
};

/**
 * @swagger
 * /api/v1/ai/generate:
 *   post:
 *     summary: Generate AI content
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIGeneration'
 *     responses:
 *       201:
 *         description: Content generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/generate',
  [
    body('prompt')
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Prompt must be between 1 and 2000 characters'),
    body('model')
      .isString()
      .isIn(['gpt-4-turbo-preview', 'gpt-3.5-turbo', 'gemini-1.5-flash', 'gemini-1.5-pro', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'])
      .withMessage('Invalid AI model'),
    body('userAddress')
      .isEthereumAddress()
      .withMessage('Invalid Ethereum address'),
    body('maxTokens')
      .optional()
      .isInt({ min: 1, max: 4000 })
      .withMessage('Max tokens must be between 1 and 4000'),
    body('temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be between 0 and 2'),
  ],
  validateRequest,
  asyncHandler((req, res) => getAIController().generateContent(req, res))
);

/**
 * @swagger
 * /api/v1/ai/env-check:
 *   get:
 *     summary: Check environment configuration
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Environment status
 */
router.get(
  '/env-check',
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasGemini: !!process.env.GEMINI_API_KEY,
        hasGroq: !!process.env.GROQ_API_KEY,
        hasDeepSeek: !!process.env.DEEPSEEK_API_KEY,
        geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      }
    });
  })
);

/**
 * @swagger
 * /api/v1/ai/models:
 *   get:
 *     summary: Get available AI models
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: List of available AI models
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get(
  '/models',
  asyncHandler((req, res) => getAIController().getModels(req, res))
);

/**
 * @swagger
 * /api/v1/ai/generation/{requestId}:
 *   get:
 *     summary: Get generation status and result
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Generation request ID
 *     responses:
 *       200:
 *         description: Generation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Generation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/generation/:requestId',
  [
    param('requestId')
      .matches(/^ai_\d+_[a-z0-9]+$/)
      .withMessage('Invalid request ID format'),
  ],
  validateRequest,
  asyncHandler((req, res) => getAIController().getGeneration(req, res))
);

/**
 * @swagger
 * /api/v1/ai/validate:
 *   post:
 *     summary: Validate AI output against original
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt, output, model, expectedHash]
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: 'Write a poem about AI'
 *               output:
 *                 type: string
 *                 example: 'AI brings us...' 
 *               model:
 *                 type: string
 *                 example: 'gpt-4'
 *               expectedHash:
 *                 type: string
 *                 example: 'abc123def456'
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post(
  '/validate',
  [
    body('prompt').isString().notEmpty(),
    body('output').isString().notEmpty(),
    body('model').isString().notEmpty(),
    body('expectedHash').isString().isLength({ min: 64, max: 66 }),
  ],
  validateRequest,
  asyncHandler((req, res) => getAIController().validateOutput(req, res))
);

/**
 * @swagger
 * /api/v1/ai/user/{address}/generations:
 *   get:
 *     summary: Get user's generation history
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: User's wallet address
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: User generation history
 */
router.get(
  '/user/:address/generations',
  [
    param('address')
      .isEthereumAddress()
      .withMessage('Invalid Ethereum address'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  asyncHandler((req, res) => getAIController().getUserGenerations(req, res))
);

export default router;
