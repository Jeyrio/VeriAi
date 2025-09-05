import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validation';
import { VerificationController } from '@/controllers/VerificationController';
import { VerificationService } from '@/services/VerificationService';
import { MultichainContractService, ChainType } from '@/services/multichain';

const router = Router();
const verificationController = new VerificationController();
const verificationService = new VerificationService();
const multichainService = new MultichainContractService();

/**
 * Custom validator for multichain addresses
 */
const isMultichainAddress = (value: string, { req }: any) => {
  const chain = req.body?.chain || req.query?.chain || 'ethereum';
  
  if (chain === 'ethereum') {
    // Ethereum address validation (0x + 40 hex chars)
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  } else if (chain === 'solana') {
    // Solana address validation (base58, 32-44 chars)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
  }
  
  return false;
};

/**
 * @swagger
 * /api/v1/verification/multichain/request:
 *   post:
 *     summary: Request verification for AI content on specified blockchain
 *     tags: [Verification, Multichain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt, model, userAddress, output, chain]
 *             properties:
 *               prompt:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: 'Generate a summary of blockchain technology'
 *               model:
 *                 type: string
 *                 enum: ['gpt-4-turbo-preview', 'gpt-3.5-turbo', 'gemini-1.5-flash', 'gemini-1.5-pro', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
 *                 example: 'gpt-4-turbo-preview'
 *               userAddress:
 *                 type: string
 *                 description: 'Ethereum (0x...) or Solana (base58) address'
 *                 example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *               output:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *                 example: 'Blockchain is a distributed ledger technology...'
 *               chain:
 *                 type: string
 *                 enum: ['ethereum', 'solana']
 *                 default: 'solana'
 *                 example: 'solana'
 *               outputHash:
 *                 type: string
 *                 description: 'Hash of the output for verification'
 *               signature:
 *                 type: string
 *                 description: 'User signature for authentication'
 *               message:
 *                 type: string
 *                 description: 'Message that was signed'
 *               feeAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: 'Fee amount in native token (ETH/SOL)'
 *                 example: 0.01
 *     responses:
 *       201:
 *         description: Verification request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: 'solana_1647858123456_abc123def'
 *                     transactionHash:
 *                       type: string
 *                       example: 'solana_tx_1647858123456_xyz789'
 *                     blockNumber:
 *                       type: number
 *                       example: 123456789
 *                     chain:
 *                       type: string
 *                       example: 'solana'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  '/multichain/request',
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
      .custom(isMultichainAddress)
      .withMessage('Invalid address format for specified chain'),
    body('output')
      .isString()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Output must be between 1 and 10000 characters'),
    body('chain')
      .optional()
      .isIn(['ethereum', 'solana'])
      .withMessage('Chain must be either ethereum or solana'),
    body('outputHash')
      .optional()
      .isString()
      .withMessage('Output hash must be a string'),
    body('signature')
      .optional()
      .isString()
      .withMessage('Signature must be a string'),
    body('message')
      .optional()
      .isString()
      .withMessage('Message must be a string'),
    body('feeAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Fee amount must be a positive number'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { userAddress, prompt, model, output, chain = 'solana', feeAmount = 0 } = req.body;

    try {
      // Request verification on the specified chain
      const response = await multichainService.requestVerification({
        userAddress,
        prompt,
        model,
        feeAmount,
        chain: chain as ChainType
      });

      res.status(201).json({
        success: true,
        data: response
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/verification/multichain/mint:
 *   post:
 *     summary: Mint NFT certificate for verified content on specified blockchain
 *     tags: [Verification, Multichain, NFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userAddress, prompt, output, model, verificationId, chain]
 *             properties:
 *               userAddress:
 *                 type: string
 *                 description: 'Ethereum (0x...) or Solana (base58) address'
 *                 example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *               prompt:
 *                 type: string
 *                 example: 'Generate a summary of blockchain technology'
 *               output:
 *                 type: string
 *                 example: 'Blockchain is a distributed ledger technology...'
 *               model:
 *                 type: string
 *                 example: 'gpt-4-turbo-preview'
 *               verificationId:
 *                 type: string
 *                 example: 'solana_1647858123456_abc123def'
 *               chain:
 *                 type: string
 *                 enum: ['ethereum', 'solana']
 *                 example: 'solana'
 *     responses:
 *       201:
 *         description: NFT minted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                       example: 'sol_nft_1647858123456_xyz789'
 *                     transactionHash:
 *                       type: string
 *                       example: 'solana_nft_1647858123456_abc123'
 *                     blockNumber:
 *                       type: number
 *                       example: 123456789
 *                     chain:
 *                       type: string
 *                       example: 'solana'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  '/multichain/mint',
  [
    body('userAddress')
      .custom(isMultichainAddress)
      .withMessage('Invalid address format for specified chain'),
    body('prompt')
      .isString()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Prompt must be between 1 and 2000 characters'),
    body('output')
      .isString()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Output must be between 1 and 10000 characters'),
    body('model')
      .isString()
      .withMessage('Model must be specified'),
    body('verificationId')
      .isString()
      .withMessage('Verification ID must be specified'),
    body('chain')
      .isIn(['ethereum', 'solana'])
      .withMessage('Chain must be either ethereum or solana'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { userAddress, prompt, output, model, verificationId, chain } = req.body;

    try {
      // Mint NFT on the specified chain
      const response = await multichainService.mintNFT({
        userAddress,
        prompt,
        output,
        model,
        verificationId,
        chain: chain as ChainType
      });

      res.status(201).json({
        success: true,
        data: response
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/verification/multichain/nft/{tokenId}:
 *   get:
 *     summary: Get NFT details from any supported blockchain
 *     tags: [Verification, Multichain, NFT]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: NFT token ID
 *       - in: query
 *         name: chain
 *         schema:
 *           type: string
 *           enum: ['ethereum', 'solana']
 *         description: Specify chain if known (optional, will auto-detect)
 *     responses:
 *       200:
 *         description: NFT details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                       example: 'sol_nft_1647858123456_xyz789'
 *                     owner:
 *                       type: string
 *                       example: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
 *                     prompt:
 *                       type: string
 *                       example: 'Generate a summary of blockchain technology'
 *                     output:
 *                       type: string
 *                       example: 'Blockchain is a distributed ledger technology...'
 *                     model:
 *                       type: string
 *                       example: 'gpt-4-turbo-preview'
 *                     verificationId:
 *                       type: string
 *                       example: 'solana_1647858123456_abc123def'
 *                     metadataURI:
 *                       type: string
 *                       example: 'https://api.veriai.app/metadata/sol_nft_1647858123456_xyz789'
 *                     timestamp:
 *                       type: string
 *                       example: '2024-01-15T10:30:00Z'
 *                     chain:
 *                       type: string
 *                       example: 'solana'
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
router.get(
  '/multichain/nft/:tokenId',
  [
    param('tokenId')
      .isString()
      .withMessage('Token ID must be a string'),
    query('chain')
      .optional()
      .isIn(['ethereum', 'solana'])
      .withMessage('Chain must be either ethereum or solana'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { tokenId } = req.params;
    const { chain } = req.query;

    try {
      const nftData = await multichainService.getNFT(tokenId, chain as ChainType);

      if (!nftData) {
        return res.status(404).json({
          success: false,
          error: 'NFT not found'
        });
      }

      res.status(200).json({
        success: true,
        data: nftData
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/verification/multichain/user/{address}/nfts:
 *   get:
 *     summary: Get user's NFTs from all supported blockchains
 *     tags: [Verification, Multichain, NFT]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: User address (Ethereum or Solana format)
 *       - in: query
 *         name: chain
 *         schema:
 *           type: string
 *           enum: ['ethereum', 'solana']
 *         description: Filter by specific chain (optional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User NFTs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     nfts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tokenId:
 *                             type: string
 *                           owner:
 *                             type: string
 *                           prompt:
 *                             type: string
 *                           output:
 *                             type: string
 *                           model:
 *                             type: string
 *                           verificationId:
 *                             type: string
 *                           chain:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     chainBreakdown:
 *                       type: object
 *                       properties:
 *                         ethereum:
 *                           type: integer
 *                           example: 20
 *                         solana:
 *                           type: integer
 *                           example: 25
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get(
  '/multichain/user/:address/nfts',
  [
    param('address')
      .isString()
      .withMessage('Address must be a string'),
    query('chain')
      .optional()
      .isIn(['ethereum', 'solana'])
      .withMessage('Chain must be either ethereum or solana'),
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
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { chain, page = 1, limit = 20 } = req.query;

    try {
      const result = await multichainService.getUserNFTs({
        userAddress: address,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        chain: chain as ChainType
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/verification/multichain/stats:
 *   get:
 *     summary: Get verification statistics across all supported blockchains
 *     tags: [Verification, Multichain]
 *     responses:
 *       200:
 *         description: Multichain verification statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ethereum:
 *                       type: object
 *                       properties:
 *                         totalVerifications:
 *                           type: integer
 *                           example: 450
 *                         verifiedCount:
 *                           type: integer
 *                           example: 400
 *                         totalNFTs:
 *                           type: integer
 *                           example: 350
 *                         totalUsers:
 *                           type: integer
 *                           example: 120
 *                     solana:
 *                       type: object
 *                       properties:
 *                         totalVerifications:
 *                           type: integer
 *                           example: 800
 *                         verifiedCount:
 *                           type: integer
 *                           example: 720
 *                         totalNFTs:
 *                           type: integer
 *                           example: 650
 *                         totalUsers:
 *                           type: integer
 *                           example: 200
 *                     combined:
 *                       type: object
 *                       properties:
 *                         totalVerifications:
 *                           type: integer
 *                           example: 1250
 *                         verifiedCount:
 *                           type: integer
 *                           example: 1120
 *                         totalNFTs:
 *                           type: integer
 *                           example: 1000
 *                         totalUsers:
 *                           type: integer
 *                           example: 320
 *       500:
 *         description: Internal server error
 */
router.get(
  '/multichain/stats',
  asyncHandler(async (req, res) => {
    try {
      const stats = await multichainService.getStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/verification/multichain/balance/{address}:
 *   get:
 *     summary: Get user's balance across supported blockchains
 *     tags: [Verification, Multichain]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: User address
 *       - in: query
 *         name: chain
 *         schema:
 *           type: string
 *           enum: ['ethereum', 'solana']
 *         description: Get balance for specific chain only
 *     responses:
 *       200:
 *         description: User balance information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ethereum:
 *                       type: number
 *                       example: 2.5
 *                       description: Balance in ETH
 *                     solana:
 *                       type: number
 *                       example: 10.25
 *                       description: Balance in SOL
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.get(
  '/multichain/balance/:address',
  [
    param('address')
      .isString()
      .withMessage('Address must be a string'),
    query('chain')
      .optional()
      .isIn(['ethereum', 'solana'])
      .withMessage('Chain must be either ethereum or solana'),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { chain } = req.query;

    try {
      const balances = await multichainService.getBalance(address, chain as ChainType);

      res.status(200).json({
        success: true,
        data: balances
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/verification/multichain/health:
 *   get:
 *     summary: Check health status of all blockchain connections
 *     tags: [Verification, Multichain]
 *     responses:
 *       200:
 *         description: Health status of all chains
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ethereum:
 *                       type: boolean
 *                       example: true
 *                     solana:
 *                       type: boolean
 *                       example: true
 *                     overall:
 *                       type: boolean
 *                       example: true
 *       500:
 *         description: Internal server error
 */
router.get(
  '/multichain/health',
  asyncHandler(async (req, res) => {
    try {
      const health = await multichainService.healthCheck();

      res.status(200).json({
        success: true,
        data: health
      });
    } catch (error) {
      throw error;
    }
  })
);

// Include original verification routes for backward compatibility
router.post(
  '/request',
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
    body('output')
      .isString()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Output must be between 1 and 10000 characters'),
    body('outputHash')
      .optional()
      .isString()
      .withMessage('Output hash must be a string'),
    body('signature')
      .optional()
      .isString()
      .withMessage('Signature must be a string'),
    body('message')
      .optional()
      .isString()
      .withMessage('Message must be a string'),
  ],
  validateRequest,
  asyncHandler(verificationController.submitProof)
);

router.get(
  '/:requestId',
  [
    param('requestId')
      .isString()
      .isLength({ min: 64, max: 66 })
      .withMessage('Invalid request ID format'),
  ],
  validateRequest,
  asyncHandler(verificationController.getVerification)
);

router.post(
  '/:requestId/fulfill',
  [
    param('requestId')
      .isString()
      .isLength({ min: 64, max: 66 })
      .withMessage('Invalid request ID format'),
    body('fdcAttestationId')
      .isString()
      .isLength({ min: 64, max: 66 })
      .withMessage('Invalid FDC attestation ID'),
    body('proof')
      .isArray()
      .withMessage('Proof must be an array'),
    body('verified')
      .isBoolean()
      .withMessage('Verified must be a boolean'),
  ],
  validateRequest,
  asyncHandler(verificationController.fulfillVerification)
);

router.get(
  '/user/:address',
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
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed'])
      .withMessage('Invalid status filter'),
  ],
  validateRequest,
  asyncHandler(verificationController.getUserVerifications)
);

router.post(
  '/:requestId/retry',
  [
    param('requestId')
      .isString()
      .isLength({ min: 64, max: 66 })
      .withMessage('Invalid request ID format'),
  ],
  validateRequest,
  asyncHandler(verificationController.retryVerification)
);

router.post(
  '/:requestId/challenge',
  [
    param('requestId')
      .isString()
      .isLength({ min: 64, max: 66 })
      .withMessage('Invalid request ID format'),
    body('challengerAddress')
      .isEthereumAddress()
      .withMessage('Invalid challenger address'),
    body('reason')
      .isString()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
    body('evidence')
      .optional()
      .isObject()
      .withMessage('Evidence must be an object'),
  ],
  validateRequest,
  asyncHandler(verificationController.challengeVerification)
);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const stats = await verificationService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  })
);

export default router;
