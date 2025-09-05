import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { logger } from '@/utils/logger';

export interface SolanaVerificationRequest {
  requester: string;
  prompt: string;
  model: string;
  chain: 'solana';
}

export interface SolanaVerificationResponse {
  requestId: string;
  transactionHash: string;
  blockNumber: number;
  chain: 'solana';
}

export interface SolanaNFTData {
  tokenId: string;
  owner: string;
  prompt: string;
  output: string;
  model: string;
  verificationId: string;
  metadataURI?: string;
  timestamp: string;
  chain: 'solana';
}

/**
 * @title SolanaContractService
 * @dev Handles all Solana blockchain interactions for VeriAI
 * Maintains same interface as original ContractService for easy migration
 */
export class SolanaContractService {
  private connection: Connection;
  private programId: PublicKey;
  private nftProgramId: PublicKey;
  private payerKeypair: Keypair;

  constructor() {
    // Initialize Solana connection
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Contract program IDs (will be set after deployment)
    this.programId = new PublicKey(
      process.env.SOLANA_VERIAI_PROGRAM_ID || '11111111111111111111111111111111'
    );
    this.nftProgramId = new PublicKey(
      process.env.SOLANA_VERIAI_NFT_PROGRAM_ID || '11111111111111111111111111111111'
    );

    // Payer keypair for transactions (backend authority)
    const payerPrivateKey = process.env.SOLANA_PAYER_PRIVATE_KEY;
    if (payerPrivateKey) {
      const secretKey = new Uint8Array(JSON.parse(payerPrivateKey));
      this.payerKeypair = Keypair.fromSecretKey(secretKey);
    } else {
      // Generate temporary keypair for development
      this.payerKeypair = Keypair.generate();
      logger.warn('No SOLANA_PAYER_PRIVATE_KEY provided, using temporary keypair');
    }

    logger.info('SolanaContractService initialized', {
      programId: this.programId.toString(),
      nftProgramId: this.nftProgramId.toString(),
      network: process.env.SOLANA_RPC_URL || 'devnet',
    });
  }

  /**
   * Request verification on Solana
   * Maintains same interface as Ethereum version
   */
  async requestVerification(params: {
    userAddress: string;
    prompt: string;
    model: string;
    feeAmount: number; // In SOL
  }): Promise<SolanaVerificationResponse> {
    const { userAddress, prompt, model, feeAmount } = params;

    try {
      logger.info('Requesting verification on Solana', {
        userAddress,
        prompt: prompt.substring(0, 50) + '...',
        model,
        feeAmount
      });

      // Create user public key
      const userPubkey = new PublicKey(userAddress);

      // For now, simulate the verification request
      // In production, this would interact with the deployed Solana program
      const transaction = new Transaction();
      
      // Add verification request instruction (placeholder)
      // Real implementation would call the VeriAISolana program
      const requestId = this.generateRequestId(userAddress, prompt, model);
      
      // Add fee transfer to treasury
      if (feeAmount > 0) {
        const treasuryPubkey = new PublicKey(
          process.env.SOLANA_TREASURY_ADDRESS || this.payerKeypair.publicKey.toString()
        );
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userPubkey,
            toPubkey: treasuryPubkey,
            lamports: Math.floor(feeAmount * LAMPORTS_PER_SOL),
          })
        );
      }

      // Simulate transaction (in production, would send real transaction)
      const simulatedTxHash = `solana_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const simulatedBlock = Math.floor(Date.now() / 1000);

      logger.info('Solana verification request processed', {
        requestId,
        transactionHash: simulatedTxHash,
        blockNumber: simulatedBlock
      });

      return {
        requestId,
        transactionHash: simulatedTxHash,
        blockNumber: simulatedBlock,
        chain: 'solana'
      };

    } catch (error) {
      logger.error('Failed to request verification on Solana', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Mint NFT on Solana
   * Maintains same interface as Ethereum version
   */
  async mintNFT(params: {
    userAddress: string;
    prompt: string;
    output: string;
    model: string;
    verificationId: string;
  }): Promise<{
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
  }> {
    const { userAddress, prompt, output, model, verificationId } = params;

    try {
      logger.info('Minting NFT on Solana', {
        userAddress,
        verificationId,
        model
      });

      // Create user public key
      const userPubkey = new PublicKey(userAddress);

      // Generate token ID (in production, would come from program)
      const tokenId = this.generateTokenId();

      // Simulate NFT minting (in production, would call Solana NFT program)
      const simulatedTxHash = `solana_nft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const simulatedBlock = Math.floor(Date.now() / 1000);

      logger.info('Solana NFT minted successfully', {
        tokenId,
        userAddress,
        verificationId,
        transactionHash: simulatedTxHash
      });

      return {
        tokenId,
        transactionHash: simulatedTxHash,
        blockNumber: simulatedBlock
      };

    } catch (error) {
      logger.error('Failed to mint NFT on Solana', {
        userAddress,
        verificationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get NFT details
   */
  async getNFT(tokenId: string): Promise<SolanaNFTData | null> {
    try {
      // In production, would query the Solana program for NFT data
      logger.info('Fetching Solana NFT', { tokenId });

      // Simulate NFT data (would come from on-chain program state)
      const mockNFT: SolanaNFTData = {
        tokenId,
        owner: '11111111111111111111111111111111', // Placeholder
        prompt: 'Sample prompt',
        output: 'Sample output',
        model: 'gpt-4',
        verificationId: 'sample-verification-id',
        metadataURI: `https://api.veriai.app/metadata/${tokenId}`,
        timestamp: new Date().toISOString(),
        chain: 'solana'
      };

      return mockNFT;

    } catch (error) {
      logger.error('Failed to get Solana NFT', {
        tokenId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Get user's Solana NFTs
   */
  async getUserNFTs(params: {
    userAddress: string;
    page: number;
    limit: number;
  }): Promise<{
    nfts: SolanaNFTData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { userAddress, page, limit } = params;

    try {
      logger.info('Fetching user Solana NFTs', { userAddress, page, limit });

      // In production, would query the Solana program for user's NFTs
      // For now, return empty result
      return {
        nfts: [],
        total: 0,
        page,
        totalPages: 0
      };

    } catch (error) {
      logger.error('Failed to get user Solana NFTs', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        nfts: [],
        total: 0,
        page,
        totalPages: 0
      };
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balanceInLamports = await this.connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      
      logger.info('Fetched Solana balance', { address, balance: balanceInSOL });
      return balanceInSOL;

    } catch (error) {
      logger.error('Failed to get Solana balance', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Get contract statistics
   */
  async getStats(): Promise<{
    totalVerifications: number;
    verifiedCount: number;
    totalNFTs: number;
    totalUsers: number;
  }> {
    try {
      // In production, would query the Solana program state
      logger.info('Fetching Solana contract stats');

      return {
        totalVerifications: 0,
        verifiedCount: 0,
        totalNFTs: 0,
        totalUsers: 0
      };

    } catch (error) {
      logger.error('Failed to get Solana contract stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        totalVerifications: 0,
        verifiedCount: 0,
        totalNFTs: 0,
        totalUsers: 0
      };
    }
  }

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  private generateRequestId(userAddress: string, prompt: string, model: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    return `solana_${timestamp}_${randomSuffix}`;
  }

  private generateTokenId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    return `sol_nft_${timestamp}_${randomSuffix}`;
  }

  /**
   * Health check for Solana connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const slot = await this.connection.getSlot();
      logger.info('Solana connection healthy', { slot });
      return true;
    } catch (error) {
      logger.error('Solana connection unhealthy', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}
