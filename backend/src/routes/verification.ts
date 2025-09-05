import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { validateRequest } from '@/middleware/validation';
import { VerificationController } from '@/controllers/VerificationController';
import { VerificationService } from '@/services/VerificationService';

const router = Router();
const verificationController = new VerificationController();
const verificationService = new VerificationService();

/**
 * @swagger
 * /api/v1/verification/request:
 *   post:
 *     summary: Request verification for AI content
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerificationRequest'
 *     responses:
 *       201:
 *         description: Verification request submitted
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

/**
 * @swagger
 * /api/v1/verification/{requestId}:
 *   get:
 *     summary: Get verification status and details
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 64
 *           maxLength: 66
 *         description: Verification request ID
 *     responses:
 *       200:
 *         description: Verification details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Verification'
 *       404:
 *         description: Verification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/verification/{requestId}/fulfill:
 *   post:
 *     summary: Fulfill verification with FDC attestation
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 64
 *           maxLength: 66
 *         description: Verification request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fdcAttestationId, proof, verified]
 *             properties:
 *               fdcAttestationId:
 *                 type: string
 *                 minLength: 64
 *                 maxLength: 66
 *                 example: 'att_1234567890abcdef'
 *               proof:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['0xabc123', '0xdef456']
 *               verified:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Verification fulfilled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Verification'
 *       404:
 *         description: Verification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/verification/user/{address}:
 *   get:
 *     summary: Get user's verification history
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: address
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
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: User verification history
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
 *       400:
 *         description: Invalid address format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/verification/{requestId}/retry:
 *   post:
 *     summary: Retry failed verification
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 64
 *           maxLength: 66
 *         description: Verification request ID
 *         example: 'ver_1234567890_abc123'
 *     responses:
 *       200:
 *         description: Verification retry initiated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Verification'
 *       400:
 *         description: Cannot retry verification in current state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Verification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/verification/{requestId}/challenge:
 *   post:
 *     summary: Challenge a verification
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 64
 *           maxLength: 66
 *         description: Verification request ID
 *         example: 'ver_1234567890_abc123'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [challengerAddress, reason]
 *             properties:
 *               challengerAddress:
 *                 type: string
 *                 pattern: '^0x[a-fA-F0-9]{40}$'
 *                 example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC'
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: 'The verification result appears to be incorrect based on technical analysis'
 *               evidence:
 *                 type: object
 *                 description: Supporting evidence for the challenge
 *                 example: { 'files': [], 'description': 'Technical proof attached' }
 *     responses:
 *       201:
 *         description: Challenge submitted successfully
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
 *       404:
 *         description: Verification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/v1/verification/stats:
 *   get:
 *     summary: Get verification statistics
 *     tags: [Verification]
 *     responses:
 *       200:
 *         description: Verification statistics
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
 *                         totalVerifications:
 *                           type: integer
 *                           example: 1250
 *                         verifiedCount:
 *                           type: integer
 *                           example: 1100
 *                         challengedCount:
 *                           type: integer
 *                           example: 50
 *                         rejectedCount:
 *                           type: integer
 *                           example: 100
 *                         successRate:
 *                           type: number
 *                           format: float
 *                           example: 88.0
 */
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
