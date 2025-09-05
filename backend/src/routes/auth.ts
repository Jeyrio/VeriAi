import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { validateEthereumAddress } from '@/middleware/validation';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Lazy instantiation to ensure env vars are loaded
let authController: AuthController;
const getController = () => {
  if (!authController) {
    authController = new AuthController();
  }
  return authController;
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user with wallet signature
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, signature, message]
 *             properties:
 *               address:
 *                 type: string
 *                 pattern: '^0x[a-fA-F0-9]{40}$'
 *                 example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *               signature:
 *                 type: string
 *                 example: '0x123abc...'
 *               message:
 *                 type: string
 *                 example: 'Sign this message to authenticate with VeriAI:\n\nNonce: abc123\nTimestamp: 2025-01-15T10:30:00Z'
 *     responses:
 *       200:
 *         description: Authentication successful
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
 *                         token:
 *                           type: string
 *                           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                         user:
 *                           type: object
 *                           properties:
 *                             address:
 *                               type: string
 *                               example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *                             authenticated:
 *                               type: boolean
 *                               example: true
 *                             totalGenerations:
 *                               type: integer
 *                               example: 5
 *                             totalVerifications:
 *                               type: integer
 *                               example: 3
 *                             totalNFTs:
 *                               type: integer
 *                               example: 2
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => getController().login(req, res))
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Logged out successfully'
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => getController().logout(req, res))
);

/**
 * @swagger
 * /api/v1/auth/profile/{userAddress}:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
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
 *         description: User profile data
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
 *                         address:
 *                           type: string
 *                           example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: '2025-01-15T10:30:00Z'
 *                         lastLoginAt:
 *                           type: string
 *                           format: date-time
 *                           example: '2025-01-15T12:30:00Z'
 *                         lastActivity:
 *                           type: string
 *                           format: date-time
 *                           example: '2025-01-15T12:35:00Z'
 *                         stats:
 *                           type: object
 *                           properties:
 *                             totalGenerations:
 *                               type: integer
 *                               example: 5
 *                             totalVerifications:
 *                               type: integer
 *                               example: 3
 *                             totalNFTs:
 *                               type: integer
 *                               example: 2
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/profile/:userAddress',
  validateEthereumAddress,
  asyncHandler(async (req, res) => getController().getProfile(req, res))
);

/**
 * @swagger
 * /api/v1/auth/nonce/{userAddress}:
 *   post:
 *     summary: Generate nonce for wallet signature verification
 *     tags: [Auth]
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
 *         description: Nonce generated successfully
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
 *                         nonce:
 *                           type: string
 *                           example: 'abc123def456'
 *                         message:
 *                           type: string
 *                           example: 'Sign this message to authenticate with VeriAI:\n\nNonce: abc123def456\nTimestamp: 2025-01-15T10:30:00Z'
 *       400:
 *         description: Invalid address format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/nonce/:userAddress',
  validateEthereumAddress,
  asyncHandler(async (req, res) => getController().generateNonce(req, res))
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                         token:
 *                           type: string
 *                           example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => getController().refreshToken(req, res))
);

/**
 * @swagger
 * /api/v1/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *     responses:
 *       200:
 *         description: Token verification result
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
 *                         address:
 *                           type: string
 *                           example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *                         valid:
 *                           type: boolean
 *                           example: true
 */
router.post(
  '/verify',
  asyncHandler(async (req, res) => getController().verifyToken(req, res))
);

export default router;
