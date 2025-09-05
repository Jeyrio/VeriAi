import { Router } from 'express';
import { AIService } from '@/services/AIService';
import { VerificationService } from '@/services/VerificationService';
import { ContractService } from '@/services/ContractService';
import {
  validateEthereumAddress,
  validatePagination,
} from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();
const aiService = new AIService();
const verificationService = new VerificationService();

// Lazy instantiation to ensure env vars are loaded
let contractService: ContractService;
const getContractService = () => {
  if (!contractService) {
    contractService = new ContractService();
  }
  return contractService;
};

/**
 * @swagger
 * /api/v1/user/{userAddress}/generations:
 *   get:
 *     summary: Get user's AI generations
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *         example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User's AI generations
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         generations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/GenerationResult'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get(
  '/:userAddress/generations',
  validateEthereumAddress,
  validatePagination,
  asyncHandler(async (req, res) => {
    const { userAddress } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const generations = await aiService.getUserGenerations(
      userAddress,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      data: generations,
    });
  })
);

/**
 * @swagger
 * /api/v1/user/{userAddress}/verifications:
 *   get:
 *     summary: Get user's verifications
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *         example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, verified, challenged, rejected]
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: User's verifications
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         verifications:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Verification'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get(
  '/:userAddress/verifications',
  validateEthereumAddress,
  validatePagination,
  asyncHandler(async (req, res) => {
    const { userAddress } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const verifications = await verificationService.getUserVerifications({
      userAddress,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
    });

    res.status(200).json({
      success: true,
      data: verifications,
    });
  })
);

/**
 * @swagger
 * /api/v1/user/{userAddress}/nfts:
 *   get:
 *     summary: Get user's NFT collection
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *         example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User's NFT collection
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         nfts:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/NFT'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
router.get(
  '/:userAddress/nfts',
  validateEthereumAddress,
  validatePagination,
  asyncHandler(async (req, res) => {
    const { userAddress } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const nfts = await getContractService().getUserNFTs({
      userAddress,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.status(200).json({
      success: true,
      data: nfts,
    });
  })
);

/**
 * @swagger
 * /api/v1/user/{userAddress}/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Ethereum wallet address
 *         example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalGenerations:
 *                           type: integer
 *                           example: 10
 *                         totalVerifications:
 *                           type: integer
 *                           example: 7
 *                         totalNFTs:
 *                           type: integer
 *                           example: 5
 *                         lastActivity:
 *                           type: string
 *                           format: date-time
 *                           example: '2025-01-15T10:30:00Z'
 */
router.get(
  '/:userAddress/stats',
  validateEthereumAddress,
  asyncHandler(async (req, res) => {
    const { userAddress } = req.params;

    // Get comprehensive stats from all services
    const [generations, verifications, nfts, allVerifications] = await Promise.all([
      aiService.getUserGenerations(userAddress, 1, 1),
      verificationService.getUserVerifications({
        userAddress,
        page: 1,
        limit: 1,
      }),
      getContractService().getUserNFTs({
        userAddress,
        page: 1,
        limit: 1,
      }),
      // Get all verifications to calculate success rate
      verificationService.getUserVerifications({
        userAddress,
        page: 1,
        limit: 1000,
      }),
    ]);

    // Calculate success rate
    const totalVerifications = allVerifications.total;
    const verifiedCount = allVerifications.verifications.filter(v => v.status === 'verified').length;
    const successRate = totalVerifications > 0 ? Math.round((verifiedCount / totalVerifications) * 100) : 0;

    // Calculate activity today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayGenerations = generations.generations?.filter(g => 
      new Date(g.timestamp) >= today
    ).length || 0;

    // Get last activity timestamp
    const lastActivity = generations.generations?.[0]?.timestamp || 
                        new Date().toISOString();

    res.status(200).json({
      success: true,
      data: {
        totalGenerations: generations.total,
        totalVerifications: verifications.total,
        totalNFTs: nfts.total,
        successRate,
        activeToday: todayGenerations,
        lastActivity,
        verificationsChange: 0,
        successRateChange: 0,
        nftsChange: 0,
        activeChange: 0,
      },
    });
  })
);

export default router;
