import { Request, Response } from 'express';
import { VerificationService } from '@/services/VerificationService';
import { ContractService } from '@/services/ContractService';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class VerificationController {
  private verificationService: VerificationService;
  private contractService: ContractService;

  constructor() {
    this.verificationService = new VerificationService();
    this.contractService = new ContractService();
  }

  /**
   * Submit proof for verification
   */
  submitProof = async (req: Request, res: Response): Promise<void> => {
    const {
      prompt,
      output,
      model,
      outputHash,
      userAddress,
      signature,
      message,
      attestationData,
    } = req.body;

    try {
      const verification = await this.verificationService.submitProof({
        prompt,
        output,
        model,
        outputHash,
        userAddress,
        signature,
        message,
        attestationData,
      });

      logger.info('Proof submitted for verification', {
        verificationId: verification.id,
        userAddress,
        model,
      });

      res.status(201).json({
        success: true,
        data: {
          ...verification,
          confidence: verification.metadata?.confidence || 95.0,
          requestId: verification.id,
          createdAt: verification.timestamp,
          updatedAt: verification.timestamp
        },
      });
    } catch (error) {
      logger.error('Failed to submit proof', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userAddress,
        model,
      });

      throw createError.internal('Failed to submit proof for verification');
    }
  };

  /**
   * Get verification status
   */
  getVerification = async (req: Request, res: Response): Promise<void> => {
    const { verificationId } = req.params;

    try {
      const verification = await this.verificationService.getVerification(
        verificationId
      );

      if (!verification) {
        throw createError.notFound('Verification not found');
      }

      res.status(200).json({
        success: true,
        data: {
          ...verification,
          confidence: verification.metadata?.confidence || 95.0,
          requestId: verification.id,
          createdAt: verification.timestamp,
          updatedAt: verification.verifiedAt || verification.timestamp
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }

      logger.error('Failed to fetch verification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        verificationId,
      });

      throw createError.internal('Failed to fetch verification');
    }
  };

  /**
   * Verify FDC attestation
   */
  verifyAttestation = async (req: Request, res: Response): Promise<void> => {
    const { attestationData, merkleProof } = req.body;

    try {
      const verification = await this.verificationService.verifyAttestation({
        attestationData,
        merkleProof,
      });

      res.status(200).json({
        success: true,
        data: verification,
      });
    } catch (error) {
      logger.error('Failed to verify attestation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        attestationData: attestationData?.slice(0, 100),
      });

      throw createError.internal('Failed to verify attestation');
    }
  };

  /**
   * Get verification history for user
   */
  getUserVerifications = async (req: Request, res: Response): Promise<void> => {
    const { userAddress } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    try {
      const verifications = await this.verificationService.getUserVerifications({
        userAddress,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
      });

      // Transform verifications to include frontend-expected fields
      const transformedVerifications = {
        ...verifications,
        verifications: verifications.verifications.map(v => ({
          ...v,
          confidence: v.metadata?.confidence || 95.0,
          requestId: v.id,
          createdAt: v.timestamp,
          updatedAt: v.verifiedAt || v.timestamp
        }))
      };

      res.status(200).json({
        success: true,
        data: transformedVerifications,
      });
    } catch (error) {
      logger.error('Failed to fetch user verifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userAddress,
      });

      throw createError.internal('Failed to fetch user verifications');
    }
  };

  /**
   * Challenge a verification
   */
  challengeVerification = async (req: Request, res: Response): Promise<void> => {
    const { verificationId } = req.params;
    const { challengerAddress, reason, evidence } = req.body;

    try {
      const challenge = await this.verificationService.challengeVerification({
        verificationId,
        challengerAddress,
        reason,
        evidence,
      });

      logger.info('Verification challenged', {
        verificationId,
        challengerAddress,
        reason,
      });

      res.status(201).json({
        success: true,
        data: challenge,
      });
    } catch (error) {
      logger.error('Failed to challenge verification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        verificationId,
        challengerAddress,
      });

      throw createError.internal('Failed to challenge verification');
    }
  };

  /**
   * Fulfill verification with FDC attestation
   */
  fulfillVerification = async (req: Request, res: Response): Promise<void> => {
    const { requestId } = req.params;
    const { fdcAttestationId, proof, verified } = req.body;

    try {
      // Get the verification request
      const verification = await this.verificationService.getVerification(requestId);
      if (!verification) {
        throw createError.notFound('Verification request not found');
      }

      // Update verification with FDC attestation result
      const updatedVerification = await this.verificationService.fulfillVerification({
        verificationId: requestId,
        fdcAttestationId,
        proof,
        verified,
      });

      // If verified, mint NFT
      if (verified && updatedVerification) {
        try {
          const nftResult = await this.contractService.mintNFT({
            userAddress: verification.userAddress,
            prompt: verification.prompt,
            output: verification.output,
            model: verification.model,
            requestId: requestId,
          });

          // Update verification with NFT information
          await this.verificationService.updateVerificationNFT(requestId, {
            nftTokenId: nftResult.tokenId,
            transactionHash: nftResult.transactionHash,
            blockNumber: nftResult.blockNumber,
          });

          logger.info('Verification fulfilled and NFT minted', {
            verificationId: requestId,
            tokenId: nftResult.tokenId,
            transactionHash: nftResult.transactionHash,
          });
        } catch (nftError) {
          logger.error('Failed to mint NFT after verification', {
            verificationId: requestId,
            error: nftError instanceof Error ? nftError.message : 'Unknown error',
          });
          // Don't fail the entire request if NFT minting fails
        }
      }

      res.status(200).json({
        success: true,
        data: updatedVerification,
      });
    } catch (error) {
      logger.error('Failed to fulfill verification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        fdcAttestationId,
      });

      throw createError.internal('Failed to fulfill verification');
    }
  };

  /**
   * Retry failed verification
   */
  retryVerification = async (req: Request, res: Response): Promise<void> => {
    const { requestId } = req.params;

    try {
      // Get the existing verification
      const verification = await this.verificationService.getVerification(requestId);
      if (!verification) {
        throw createError.notFound('Verification request not found');
      }

      // Check if retry is allowed
      if (verification.status !== 'rejected') {
        throw createError.badRequest('Can only retry rejected verifications');
      }

      // Retry the verification
      const retriedVerification = await this.verificationService.retryVerification(requestId);

      logger.info('Verification retried', {
        verificationId: requestId,
        previousStatus: verification.status,
      });

      res.status(200).json({
        success: true,
        data: retriedVerification,
      });
    } catch (error) {
      logger.error('Failed to retry verification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      });

      throw createError.internal('Failed to retry verification');
    }
  };
}
