import axios from 'axios';
import { createHash } from 'crypto';
import { logger } from '@/utils/logger';

interface AttestationRequest {
  verificationId: string;
  prompt: string;
  output: string;
  model: string;
  outputHash: string;
  userAddress: string;
  timestamp: string;
}

interface AttestationResponse {
  attestationId: string;
  status: 'submitted' | 'confirmed' | 'rejected';
  merkleRoot?: string;
  proof?: any;
  timestamp: string;
}

interface VerifyAttestationResponse {
  valid: boolean;
  attestationId?: string;
  details?: any;
}

export class FDCService {
  private fdcApiUrl: string;
  private fdcApiKey: string;

  constructor() {
    this.fdcApiUrl = process.env.FDC_API_URL || 'https://fdc-api.flare.network';
    this.fdcApiKey = process.env.FDC_API_KEY || '';
    
    if (!this.fdcApiKey) {
      logger.warn('FDC API key not provided - some features may not work');
    }
  }

  /**
   * Submit attestation request to FDC
   */
  async submitAttestation(request: AttestationRequest): Promise<string> {
    try {
      const attestationData = {
        type: 'ai_verification',
        data: {
          verificationId: request.verificationId,
          promptHash: this.hashData(request.prompt),
          outputHash: request.outputHash,
          model: request.model,
          userAddress: request.userAddress,
          timestamp: request.timestamp,
        },
        metadata: {
          version: '1.0',
          source: 'veriai',
        },
      };

      const response = await axios.post(
        `${this.fdcApiUrl}/attestations`,
        attestationData,
        {
          headers: {
            'Authorization': `Bearer ${this.fdcApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const attestationId = response.data.attestationId;

      logger.info('FDC attestation submitted', {
        verificationId: request.verificationId,
        attestationId,
      });

      return attestationId;
    } catch (error) {
      logger.error('Failed to submit FDC attestation', {
        verificationId: request.verificationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('Failed to submit FDC attestation');
    }
  }

  /**
   * Get attestation status from FDC
   */
  async getAttestationStatus(attestationId: string): Promise<AttestationResponse> {
    try {
      const response = await axios.get(
        `${this.fdcApiUrl}/attestations/${attestationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.fdcApiKey}`,
          },
          timeout: 10000,
        }
      );

      return {
        attestationId,
        status: response.data.status,
        merkleRoot: response.data.merkleRoot,
        proof: response.data.proof,
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      logger.error('Failed to get FDC attestation status', {
        attestationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('Failed to get attestation status');
    }
  }

  /**
   * Verify attestation with FDC
   */
  async verifyAttestation(
    attestationData: any,
    merkleProof: string[]
  ): Promise<VerifyAttestationResponse> {
    try {
      const verificationRequest = {
        attestationData,
        merkleProof,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(
        `${this.fdcApiUrl}/verify`,
        verificationRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.fdcApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const isValid = response.data.valid === true;
      
      logger.info('FDC attestation verification result', {
        valid: isValid,
        attestationId: response.data.attestationId,
      });

      return {
        valid: isValid,
        attestationId: response.data.attestationId,
        details: response.data.details,
      };
    } catch (error) {
      logger.error('Failed to verify FDC attestation', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        valid: false,
      };
    }
  }

  /**
   * Get FDC network statistics
   */
  async getNetworkStats(): Promise<{
    totalAttestations: number;
    confirmedAttestations: number;
    averageConfirmationTime: number;
    networkHealth: string;
  }> {
    try {
      const response = await axios.get(
        `${this.fdcApiUrl}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.fdcApiKey}`,
          },
          timeout: 10000,
        }
      );

      return {
        totalAttestations: response.data.totalAttestations || 0,
        confirmedAttestations: response.data.confirmedAttestations || 0,
        averageConfirmationTime: response.data.averageConfirmationTime || 0,
        networkHealth: response.data.networkHealth || 'unknown',
      };
    } catch (error) {
      logger.error('Failed to get FDC network stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        totalAttestations: 0,
        confirmedAttestations: 0,
        averageConfirmationTime: 0,
        networkHealth: 'unknown',
      };
    }
  }

  /**
   * Generate Merkle proof for attestation
   */
  async generateMerkleProof(attestationId: string): Promise<{
    merkleRoot: string;
    proof: string[];
    leaf: string;
  }> {
    try {
      const response = await axios.get(
        `${this.fdcApiUrl}/attestations/${attestationId}/proof`,
        {
          headers: {
            'Authorization': `Bearer ${this.fdcApiKey}`,
          },
          timeout: 10000,
        }
      );

      return {
        merkleRoot: response.data.merkleRoot,
        proof: response.data.proof,
        leaf: response.data.leaf,
      };
    } catch (error) {
      logger.error('Failed to generate Merkle proof', {
        attestationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('Failed to generate Merkle proof');
    }
  }

  /**
   * Subscribe to attestation status updates
   */
  async subscribeToUpdates(
    attestationId: string,
    callbackUrl: string
  ): Promise<{ subscriptionId: string }> {
    try {
      const subscription = {
        attestationId,
        callbackUrl,
        events: ['status_change', 'confirmation', 'rejection'],
      };

      const response = await axios.post(
        `${this.fdcApiUrl}/subscriptions`,
        subscription,
        {
          headers: {
            'Authorization': `Bearer ${this.fdcApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      logger.info('FDC subscription created', {
        attestationId,
        subscriptionId: response.data.subscriptionId,
      });

      return {
        subscriptionId: response.data.subscriptionId,
      };
    } catch (error) {
      logger.error('Failed to create FDC subscription', {
        attestationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Batch submit multiple attestations
   */
  async batchSubmitAttestations(
    requests: AttestationRequest[]
  ): Promise<{ attestationIds: string[]; failedCount: number }> {
    const attestationIds: string[] = [];
    let failedCount = 0;

    try {
      const batchData = {
        attestations: requests.map(request => ({
          type: 'ai_verification',
          data: {
            verificationId: request.verificationId,
            promptHash: this.hashData(request.prompt),
            outputHash: request.outputHash,
            model: request.model,
            userAddress: request.userAddress,
            timestamp: request.timestamp,
          },
          metadata: {
            version: '1.0',
            source: 'veriai',
          },
        })),
      };

      const response = await axios.post(
        `${this.fdcApiUrl}/attestations/batch`,
        batchData,
        {
          headers: {
            'Authorization': `Bearer ${this.fdcApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const results = response.data.results || [];
      
      results.forEach((result: any, index: number) => {
        if (result.success) {
          attestationIds.push(result.attestationId);
        } else {
          failedCount++;
          logger.error('Failed to submit attestation in batch', {
            verificationId: requests[index].verificationId,
            error: result.error,
          });
        }
      });

      logger.info('FDC batch attestations submitted', {
        total: requests.length,
        successful: attestationIds.length,
        failed: failedCount,
      });

      return { attestationIds, failedCount };
    } catch (error) {
      logger.error('Failed to batch submit FDC attestations', {
        count: requests.length,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('Failed to batch submit attestations');
    }
  }

  /**
   * Hash data for FDC submission
   */
  private hashData(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate FDC configuration
   */
  validateConfiguration(): boolean {
    const isValid = !!(this.fdcApiUrl && this.fdcApiKey);
    
    if (!isValid) {
      logger.warn('FDC configuration incomplete', {
        hasApiUrl: !!this.fdcApiUrl,
        hasApiKey: !!this.fdcApiKey,
      });
    }

    return isValid;
  }
}
