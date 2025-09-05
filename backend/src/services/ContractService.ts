import { ethers } from 'ethers';
import { logger } from '@/utils/logger';
import { DatabaseService } from './DatabaseService';

// Updated Contract ABIs based on deployed contracts
const VERIAI_ABI = [
  'function requestVerification(string memory prompt, string memory model) external payable returns (bytes32)',
  'function getVerificationRequest(bytes32 requestId) external view returns (address user, string memory prompt, string memory model, uint8 status, uint256 timestamp)',
  'function setNFTContract(address nftContract) external',
  'function updateVerificationFee(uint256 newFee) external',
  'function getNFTContract() external view returns (address)',
  'function getVerificationFee() external view returns (uint256)',
  'function getTreasury() external view returns (address)',
  'event VerificationRequested(bytes32 indexed requestId, address indexed user, string prompt, string model)',
  'event VerificationCompleted(bytes32 indexed requestId, bool verified)',
];

const VERIAI_NFT_ABI = [
  'function mint(address to, string memory prompt, string memory output, string memory model, bytes32 requestId) external returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function grantRole(bytes32 role, address account) external',
  'event NFTMinted(uint256 indexed tokenId, address indexed owner, bytes32 indexed requestId)',
];

const FDC_RELAYER_ABI = [
  'function getVeriAIContract() external view returns (address)',
  'function getFDCHub() external view returns (address)',
  'function getTreasury() external view returns (address)',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'event AttestationSubmitted(bytes32 indexed requestId, address indexed provider)',
  'event AttestationVerified(bytes32 indexed requestId, bool verified)',
];

interface MintNFTParams {
  userAddress: string;
  prompt: string;
  output: string;
  model: string;
  requestId: string;
}

interface ContractVerificationRequest {
  requestId: string;
  user: string;
  prompt: string;
  model: string;
  status: number;
  timestamp: string;
}

interface ContractNFTData {
  tokenId: string;
  owner: string;
  prompt: string;
  output: string;
  model: string;
  requestId: string;
  metadataURI?: string;
  timestamp: string;
}

export class ContractService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private veriAIContract: ethers.Contract;
  private nftContract: ethers.Contract;
  private fdcRelayerContract: ethers.Contract;
  private db: DatabaseService;

  constructor() {
    // Initialize provider with production settings
    this.provider = new ethers.JsonRpcProvider(
      process.env.NETWORK_URL || process.env.RPC_URL || 'https://coston2-api.flare.network/ext/bc/C/rpc'
    );
    
    // Initialize signer for contract interactions
    if (process.env.PRIVATE_KEY) {
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    } else {
      throw new Error('Private key not provided in environment variables');
    }

    // Initialize contracts with deployed addresses
    const veriAIAddress = process.env.VERI_AI_CONTRACT_ADDRESS || process.env.VERIAI_CONTRACT_ADDRESS;
    const nftAddress = process.env.VERI_AI_NFT_CONTRACT_ADDRESS || process.env.VERIAI_NFT_CONTRACT_ADDRESS;
    const fdcRelayerAddress = process.env.FDC_RELAYER_CONTRACT_ADDRESS;

    if (!veriAIAddress || !nftAddress || !fdcRelayerAddress) {
      throw new Error('Contract addresses not provided in environment variables');
    }

    this.veriAIContract = new ethers.Contract(veriAIAddress, VERIAI_ABI, this.signer);
    this.nftContract = new ethers.Contract(nftAddress, VERIAI_NFT_ABI, this.signer);
    this.fdcRelayerContract = new ethers.Contract(fdcRelayerAddress, FDC_RELAYER_ABI, this.signer);

    this.db = new DatabaseService();

    logger.info('ContractService initialized', {
      veriAIAddress,
      nftAddress,
      fdcRelayerAddress,
      network: process.env.NETWORK_CHAIN_ID || '114',
    });
  }

  /**
   * Mint NFT for verified AI output
   */
  async mintNFT(params: MintNFTParams): Promise<{
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
  }> {
    const { userAddress, prompt, output, model, requestId } = params;

    try {
      // Convert requestId to bytes32 for smart contract
      const bytes32RequestId = ethers.id(requestId);

      // Mint NFT through contract
      const tx = await this.nftContract.mint(
        userAddress,
        prompt,
        output,
        model,
        bytes32RequestId
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.nftContract.interface.parseLog(log);
          return parsedLog?.name === 'NFTMinted';
        } catch {
          return false;
        }
      });
      
      let tokenId = '';
      if (mintEvent) {
        const parsedLog = this.nftContract.interface.parseLog(mintEvent);
        tokenId = parsedLog?.args?.tokenId?.toString() || '';
      }

      logger.info('NFT minted successfully', {
        tokenId,
        userAddress,
        requestId,
        transactionHash: receipt.hash,
      });

      // Store NFT data in database (map ContractNFTData to DatabaseService NFTData)
      const dbNFTData = {
        tokenId,
        owner: userAddress,
        prompt,
        output,
        model,
        verificationId: requestId, // Map requestId to verificationId for database
        metadataURI: '', // Will be generated later
        timestamp: new Date().toISOString(),
      };

      await this.db.saveNFT(dbNFTData);

      return {
        tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      logger.error('Failed to mint NFT', {
        userAddress,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Get NFT details
   */
  async getNFT(tokenId: string): Promise<ContractNFTData | null> {
    try {
      // Try to get from database first
      const nftData = await this.db.getNFT(tokenId);
      if (nftData) {
        return {
          tokenId: nftData.tokenId,
          owner: nftData.owner,
          prompt: nftData.prompt,
          output: nftData.output,
          model: nftData.model,
          requestId: nftData.verificationId, // Database uses verificationId
          metadataURI: nftData.metadataURI,
          timestamp: nftData.timestamp,
        };
      }

      // If not in database, fetch from contract
      const owner = await this.nftContract.ownerOf(tokenId);
      const metadataURI = await this.nftContract.tokenURI(tokenId);

      // Basic NFT data from contract
      const basicNFT: ContractNFTData = {
        tokenId,
        owner,
        prompt: '',
        output: '',
        model: '',
        requestId: '',
        metadataURI,
        timestamp: '',
      };

      return basicNFT;
    } catch (error) {
      logger.error('Failed to get NFT', {
        tokenId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return null;
    }
  }

  /**
   * Get user's NFTs
   */
  async getUserNFTs(params: {
    userAddress: string;
    page: number;
    limit: number;
  }): Promise<{
    nfts: ContractNFTData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { userAddress, page, limit } = params;

    try {
      // Get from database
      const result = await this.db.getUserNFTs(userAddress, page, limit);
      
      // Map database NFTData to ContractNFTData
      const nfts: ContractNFTData[] = result.nfts.map(nft => ({
        tokenId: nft.tokenId,
        owner: nft.owner,
        prompt: nft.prompt,
        output: nft.output,
        model: nft.model,
        requestId: nft.verificationId, // Map verificationId to requestId
        metadataURI: nft.metadataURI,
        timestamp: nft.timestamp,
      }));
      
      // If database is empty, try to sync from contract
      if (result.total === 0) {
        await this.syncUserNFTsFromContract(userAddress);
        const updatedResult = await this.db.getUserNFTs(userAddress, page, limit);
        const mappedNfts: ContractNFTData[] = updatedResult.nfts.map(nft => ({
          tokenId: nft.tokenId,
          owner: nft.owner,
          prompt: nft.prompt,
          output: nft.output,
          model: nft.model,
          requestId: nft.verificationId,
          metadataURI: nft.metadataURI,
          timestamp: nft.timestamp,
        }));
        
        return {
          nfts: mappedNfts,
          total: updatedResult.total,
          page: updatedResult.page,
          totalPages: updatedResult.totalPages,
        };
      }

      return {
        nfts,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      };
    } catch (error) {
      logger.error('Failed to get user NFTs', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        nfts: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  /**
   * Get contract statistics
   */
  async getStats(): Promise<{
    totalVerifications: number;
    verifiedCount: number;
    challengedCount: number;
    totalNFTs: number;
    totalUsers: number;
  }> {
    try {
      const totalNFTs = await this.nftContract.totalSupply();

      // Get total users from database
      const dbStats = await this.db.getContractStats();

      return {
        totalVerifications: dbStats.totalVerifications,
        verifiedCount: dbStats.totalVerifications, // Simplified for now
        challengedCount: 0, // Not implemented yet
        totalNFTs: totalNFTs.toString(),
        totalUsers: dbStats.totalUsers,
      };
    } catch (error) {
      logger.error('Failed to get contract statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        totalVerifications: 0,
        verifiedCount: 0,
        challengedCount: 0,
        totalNFTs: 0,
        totalUsers: 0,
      };
    }
  }

  /**
   * Sync user NFTs from contract to database
   */
  private async syncUserNFTsFromContract(userAddress: string): Promise<void> {
    try {
      const balance = await this.nftContract.balanceOf(userAddress);
      const balanceNum = balance.toNumber();

      for (let i = 0; i < balanceNum; i++) {
        const tokenId = await this.nftContract.tokenOfOwnerByIndex(userAddress, i);
        const metadataURI = await this.nftContract.tokenURI(tokenId);

        const dbNftData = {
          tokenId: tokenId.toString(),
          owner: userAddress,
          prompt: '',
          output: '',
          model: '',
          verificationId: '', // Empty for now
          metadataURI,
          timestamp: new Date().toISOString(),
        };

        await this.db.saveNFT(dbNftData);
      }

      logger.info('Synced user NFTs from contract', {
        userAddress,
        count: balanceNum,
      });
    } catch (error) {
      logger.error('Failed to sync user NFTs from contract', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Listen to contract events
   */
  setupEventListeners(): void {
    try {
      logger.info('Setting up contract event listeners...');
      
      // TODO: Event listeners disabled temporarily due to ABI mismatch
      // The deployed contracts may have different event signatures
      // Enable these when contract ABIs are properly synced
      
      logger.info('Contract event listeners setup completed (currently disabled for API testing)');
    } catch (error) {
      logger.error('Failed to set up contract event listeners', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
