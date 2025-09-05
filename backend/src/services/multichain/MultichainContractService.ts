import { logger } from '@/utils/logger';
import { SolanaContractService, SolanaVerificationRequest, SolanaVerificationResponse, SolanaNFTData } from './SolanaContractService';
import { EthereumContractService, EthereumVerificationRequest, EthereumVerificationResponse, EthereumNFTData } from './EthereumContractService';

export type ChainType = 'ethereum' | 'solana';

export interface MultichainVerificationRequest {
  requester: string;
  prompt: string;
  model: string;
  chain: ChainType;
}

export interface MultichainVerificationResponse {
  requestId: string;
  transactionHash: string;
  blockNumber: number;
  chain: ChainType;
}

export interface MultichainNFTData {
  tokenId: string;
  owner: string;
  prompt: string;
  output: string;
  model: string;
  verificationId: string;
  metadataURI?: string;
  timestamp: string;
  chain: ChainType;
}

export interface MultichainStats {
  ethereum: {
    totalVerifications: number;
    verifiedCount: number;
    totalNFTs: number;
    totalUsers: number;
  };
  solana: {
    totalVerifications: number;
    verifiedCount: number;
    totalNFTs: number;
    totalUsers: number;
  };
  combined: {
    totalVerifications: number;
    verifiedCount: number;
    totalNFTs: number;
    totalUsers: number;
  };
}

/**
 * @title MultichainContractService
 * @dev Central service that routes contract interactions to appropriate blockchain
 * Maintains same interface as original ContractService for seamless migration
 */
export class MultichainContractService {
  private solanaService: SolanaContractService;
  private ethereumService: EthereumContractService;
  private defaultChain: ChainType;

  constructor() {
    this.solanaService = new SolanaContractService();
    this.ethereumService = new EthereumContractService();
    
    // Default to Solana as specified in requirements
    this.defaultChain = 'solana';

    logger.info('MultichainContractService initialized', {
      defaultChain: this.defaultChain,
      supportedChains: ['ethereum', 'solana']
    });
  }

  /**
   * Request verification on specified chain
   */
  async requestVerification(params: {
    userAddress: string;
    prompt: string;
    model: string;
    feeAmount: number;
    chain?: ChainType;
  }): Promise<MultichainVerificationResponse> {
    const { userAddress, prompt, model, feeAmount, chain = this.defaultChain } = params;

    try {
      logger.info('Processing multichain verification request', {
        userAddress,
        chain,
        model,
        feeAmount
      });

      let response: MultichainVerificationResponse;

      switch (chain) {
        case 'solana':
          const solanaResponse = await this.solanaService.requestVerification({
            userAddress,
            prompt,
            model,
            feeAmount
          });
          response = solanaResponse;
          break;

        case 'ethereum':
          const ethereumResponse = await this.ethereumService.requestVerification({
            userAddress,
            prompt,
            model,
            feeAmount
          });
          response = ethereumResponse;
          break;

        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }

      logger.info('Multichain verification request completed', {
        requestId: response.requestId,
        chain: response.chain,
        transactionHash: response.transactionHash
      });

      return response;

    } catch (error) {
      logger.error('Failed to process multichain verification request', {
        userAddress,
        chain,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Mint NFT on specified chain
   */
  async mintNFT(params: {
    userAddress: string;
    prompt: string;
    output: string;
    model: string;
    verificationId: string;
    chain?: ChainType;
  }): Promise<{
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
    chain: ChainType;
  }> {
    const { userAddress, prompt, output, model, verificationId, chain = this.defaultChain } = params;

    try {
      logger.info('Processing multichain NFT mint', {
        userAddress,
        chain,
        verificationId,
        model
      });

      let result: { tokenId: string; transactionHash: string; blockNumber: number };

      switch (chain) {
        case 'solana':
          result = await this.solanaService.mintNFT({
            userAddress,
            prompt,
            output,
            model,
            verificationId
          });
          break;

        case 'ethereum':
          result = await this.ethereumService.mintNFT({
            userAddress,
            prompt,
            output,
            model,
            verificationId
          });
          break;

        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }

      logger.info('Multichain NFT mint completed', {
        tokenId: result.tokenId,
        chain,
        transactionHash: result.transactionHash
      });

      return {
        ...result,
        chain
      };

    } catch (error) {
      logger.error('Failed to process multichain NFT mint', {
        userAddress,
        chain,
        verificationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get NFT details from specified chain
   */
  async getNFT(tokenId: string, chain?: ChainType): Promise<MultichainNFTData | null> {
    try {
      // If chain not specified, try to detect from tokenId format
      const targetChain = chain || this.detectChainFromTokenId(tokenId);

      logger.info('Fetching multichain NFT', { tokenId, chain: targetChain });

      let nftData: MultichainNFTData | null = null;

      switch (targetChain) {
        case 'solana':
          const solanaNFT = await this.solanaService.getNFT(tokenId);
          nftData = solanaNFT;
          break;

        case 'ethereum':
          const ethereumNFT = await this.ethereumService.getNFT(tokenId);
          nftData = ethereumNFT;
          break;

        default:
          // If chain detection fails, try both chains
          const solanaResult = await this.solanaService.getNFT(tokenId);
          if (solanaResult) {
            nftData = solanaResult;
          } else {
            const ethereumResult = await this.ethereumService.getNFT(tokenId);
            nftData = ethereumResult;
          }
      }

      logger.info('Multichain NFT fetch completed', {
        tokenId,
        found: !!nftData,
        chain: nftData?.chain
      });

      return nftData;

    } catch (error) {
      logger.error('Failed to fetch multichain NFT', {
        tokenId,
        chain,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Get user's NFTs from all chains or specific chain
   */
  async getUserNFTs(params: {
    userAddress: string;
    page: number;
    limit: number;
    chain?: ChainType;
  }): Promise<{
    nfts: MultichainNFTData[];
    total: number;
    page: number;
    totalPages: number;
    chainBreakdown?: {
      ethereum: number;
      solana: number;
    };
  }> {
    const { userAddress, page, limit, chain } = params;

    try {
      logger.info('Fetching user multichain NFTs', { userAddress, page, limit, chain });

      if (chain) {
        // Fetch from specific chain
        switch (chain) {
          case 'solana':
            return await this.solanaService.getUserNFTs({ userAddress, page, limit });
          case 'ethereum':
            return await this.ethereumService.getUserNFTs({ userAddress, page, limit });
          default:
            throw new Error(`Unsupported chain: ${chain}`);
        }
      } else {
        // Fetch from all chains and combine
        const [solanaResult, ethereumResult] = await Promise.all([
          this.solanaService.getUserNFTs({ userAddress, page: 1, limit: 1000 }),
          this.ethereumService.getUserNFTs({ userAddress, page: 1, limit: 1000 })
        ]);

        // Combine and paginate results
        const allNFTs = [...solanaResult.nfts, ...ethereumResult.nfts];
        const total = allNFTs.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedNFTs = allNFTs.slice(startIndex, endIndex);

        return {
          nfts: paginatedNFTs,
          total,
          page,
          totalPages,
          chainBreakdown: {
            ethereum: ethereumResult.total,
            solana: solanaResult.total
          }
        };
      }

    } catch (error) {
      logger.error('Failed to fetch user multichain NFTs', {
        userAddress,
        chain,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        nfts: [],
        total: 0,
        page,
        totalPages: 0,
        chainBreakdown: {
          ethereum: 0,
          solana: 0
        }
      };
    }
  }

  /**
   * Get combined stats from all chains
   */
  async getStats(): Promise<MultichainStats> {
    try {
      logger.info('Fetching multichain stats');

      const [solanaStats, ethereumStats] = await Promise.all([
        this.solanaService.getStats(),
        this.ethereumService.getStats()
      ]);

      const combinedStats: MultichainStats = {
        ethereum: ethereumStats,
        solana: solanaStats,
        combined: {
          totalVerifications: ethereumStats.totalVerifications + solanaStats.totalVerifications,
          verifiedCount: ethereumStats.verifiedCount + solanaStats.verifiedCount,
          totalNFTs: ethereumStats.totalNFTs + solanaStats.totalNFTs,
          totalUsers: ethereumStats.totalUsers + solanaStats.totalUsers
        }
      };

      logger.info('Multichain stats fetched', combinedStats.combined);
      return combinedStats;

    } catch (error) {
      logger.error('Failed to fetch multichain stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        ethereum: {
          totalVerifications: 0,
          verifiedCount: 0,
          totalNFTs: 0,
          totalUsers: 0
        },
        solana: {
          totalVerifications: 0,
          verifiedCount: 0,
          totalNFTs: 0,
          totalUsers: 0
        },
        combined: {
          totalVerifications: 0,
          verifiedCount: 0,
          totalNFTs: 0,
          totalUsers: 0
        }
      };
    }
  }

  /**
   * Get account balance on specified chain
   */
  async getBalance(address: string, chain?: ChainType): Promise<{
    ethereum?: number;
    solana?: number;
  }> {
    try {
      logger.info('Fetching multichain balance', { address, chain });

      if (chain) {
        // Fetch from specific chain
        switch (chain) {
          case 'solana':
            const solanaBalance = await this.solanaService.getBalance(address);
            return { solana: solanaBalance };
          case 'ethereum':
            // Ethereum balance would require web3 implementation
            return { ethereum: 0 };
          default:
            throw new Error(`Unsupported chain: ${chain}`);
        }
      } else {
        // Fetch from all chains
        const [solanaBalance] = await Promise.all([
          this.solanaService.getBalance(address)
          // Add Ethereum balance when implemented
        ]);

        return {
          solana: solanaBalance,
          ethereum: 0 // Placeholder
        };
      }

    } catch (error) {
      logger.error('Failed to fetch multichain balance', {
        address,
        chain,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        solana: 0,
        ethereum: 0
      };
    }
  }

  /**
   * Health check for all chains
   */
  async healthCheck(): Promise<{
    ethereum: boolean;
    solana: boolean;
    overall: boolean;
  }> {
    try {
      const [ethereumHealth, solanaHealth] = await Promise.all([
        this.ethereumService.healthCheck(),
        this.solanaService.healthCheck()
      ]);

      const result = {
        ethereum: ethereumHealth,
        solana: solanaHealth,
        overall: ethereumHealth && solanaHealth
      };

      logger.info('Multichain health check completed', result);
      return result;

    } catch (error) {
      logger.error('Multichain health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        ethereum: false,
        solana: false,
        overall: false
      };
    }
  }

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  /**
   * Detect chain from token ID format
   */
  private detectChainFromTokenId(tokenId: string): ChainType {
    if (tokenId.startsWith('sol_') || tokenId.startsWith('solana_')) {
      return 'solana';
    } else if (tokenId.startsWith('eth_') || tokenId.startsWith('ethereum_')) {
      return 'ethereum';
    }
    
    // Default to configured default chain
    return this.defaultChain;
  }

  /**
   * Get service for specific chain
   */
  getChainService(chain: ChainType): SolanaContractService | EthereumContractService {
    switch (chain) {
      case 'solana':
        return this.solanaService;
      case 'ethereum':
        return this.ethereumService;
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  /**
   * Get default chain
   */
  getDefaultChain(): ChainType {
    return this.defaultChain;
  }

  /**
   * Set default chain
   */
  setDefaultChain(chain: ChainType): void {
    this.defaultChain = chain;
    logger.info('Default chain updated', { defaultChain: chain });
  }
}
