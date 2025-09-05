import { Router } from 'express';
import { ContractController } from '@/controllers/ContractController';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  validateFDCAttestationSubmission,
  validateAttestationVerification,
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
 * /api/v1/fdc/attestation:
 *   post:
 *     summary: Submit FDC attestation
 *     tags: [FDC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [verificationId, data, signature]
 *             properties:
 *               verificationId:
 *                 type: string
 *                 example: 'ver_1234567890_abc123'
 *               data:
 *                 type: object
 *                 description: Attestation data
 *               signature:
 *                 type: string
 *                 example: '0x123abc...'
 *     responses:
 *       201:
 *         description: Attestation submitted successfully
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
  '/attestation',
  validateFDCAttestationSubmission,
  asyncHandler(async (req, res) => getController().submitAttestation(req, res))
);

/**
 * @swagger
 * /api/v1/fdc/verify:
 *   post:
 *     summary: Verify FDC attestation
 *     tags: [FDC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attestationId, proof]
 *             properties:
 *               attestationId:
 *                 type: string
 *                 example: 'att_1234567890_def456'
 *               proof:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['0xabc123', '0xdef456']
 *     responses:
 *       200:
 *         description: Attestation verification result
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
 *                         verified:
 *                           type: boolean
 *                           example: true
 *                         attestationId:
 *                           type: string
 *                           example: 'att_1234567890_def456'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/verify',
  validateAttestationVerification,
  asyncHandler(async (req, res) => getController().verifyAttestation(req, res))
);

/**
 * @swagger
 * /api/v1/fdc/stats:
 *   get:
 *     summary: Get FDC network statistics
 *     tags: [FDC]
 *     responses:
 *       200:
 *         description: FDC network statistics
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
 *                         totalAttestations:
 *                           type: integer
 *                           example: 1500
 *                         confirmedAttestations:
 *                           type: integer
 *                           example: 1350
 *                         averageConfirmationTime:
 *                           type: number
 *                           format: float
 *                           example: 45.2
 *                         networkHealth:
 *                           type: string
 *                           enum: [healthy, degraded, down]
 *                           example: 'healthy'
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => getController().getFDCStats(req, res))
);

export default router;
