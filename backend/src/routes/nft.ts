import { Router } from 'express';
import { ContractController } from '@/controllers/ContractController';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  validateNFTMinting,
  validateTokenId,
  validateEthereumAddress,
  validatePagination,
} from '@/middleware/validation';

const router = Router();

// Lazy instantiation to ensure env vars are loaded
let contractController: ContractController;
const getController = () => {
  if (!contractController) {
    contractController = new ContractController();
  }
  return contractController;
};

/**
 * @swagger
 * /api/v1/nft/mint:
 *   post:
 *     summary: Mint NFT for verified AI output
 *     tags: [NFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userAddress, prompt, output, model, requestId]
 *             properties:
 *               userAddress:
 *                 type: string
 *                 pattern: '^0x[a-fA-F0-9]{40}$'
 *                 example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *               prompt:
 *                 type: string
 *                 example: 'Write a poem about blockchain'
 *               output:
 *                 type: string
 *                 example: 'Blockchain, a chain of trust...'
 *               model:
 *                 type: string
 *                 example: 'gpt-4'
 *               requestId:
 *                 type: string
 *                 example: 'ver_1234567890_abc123'
 *     responses:
 *       201:
 *         description: NFT minted successfully
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
 *                         tokenId:
 *                           type: string
 *                           example: '123'
 *                         transactionHash:
 *                           type: string
 *                           example: '0xabc123def456...'
 *                         blockNumber:
 *                           type: integer
 *                           example: 1234567
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/mint',
  validateNFTMinting,
  asyncHandler(async (req, res) => getController().mintNFT(req, res))
);

/**
 * @swagger
 * /api/v1/nft/{tokenId}:
 *   get:
 *     summary: Get NFT details by token ID
 *     tags: [NFT]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: NFT token ID
 *         example: '123'
 *     responses:
 *       200:
 *         description: NFT details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NFT'
 *       404:
 *         description: NFT not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:tokenId',
  validateTokenId,
  asyncHandler(async (req, res) => getController().getNFT(req, res))
);

/**
 * @swagger
 * /api/v1/nft/user/{userAddress}:
 *   get:
 *     summary: Get user's NFT collection
 *     tags: [NFT]
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
 *       400:
 *         description: Invalid address format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/user/:userAddress',
  validateEthereumAddress,
  validatePagination,
  asyncHandler(async (req, res) => getController().getUserNFTs(req, res))
);

/**
 * @swagger
 * /api/v1/nft/stats:
 *   get:
 *     summary: Get NFT and contract statistics
 *     tags: [NFT]
 *     responses:
 *       200:
 *         description: NFT statistics
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
 *                         totalNFTs:
 *                           type: integer
 *                           example: 500
 *                         totalVerifications:
 *                           type: integer
 *                           example: 1250
 *                         totalUsers:
 *                           type: integer
 *                           example: 150
 *                         verifiedCount:
 *                           type: integer
 *                           example: 1100
 *                         challengedCount:
 *                           type: integer
 *                           example: 50
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => getController().getStats(req, res))
);

export default router;
