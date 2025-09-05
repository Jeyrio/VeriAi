// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IVeriAISolana - Backend Integration Interface
 * @dev Interface for VeriAI verification contract on Solana
 * Designed for backend service integration only
 * Frontend never interacts with this contract directly
 * @author VeriAI Team - Solana Migration
 */
interface IVeriAISolana {
    // Enums
    enum VerificationStatus {
        Pending,
        Verified,
        Failed,
        Expired
    }

    // Structs
    struct VerificationRequest {
        address requester;
        string prompt;
        string model;
        uint64 timestamp;
        VerificationStatus status;
        bytes32 outputHash;
        bytes32 attestationId;
        uint256 feePaid;
        bool nftMinted;
    }

    struct UserStats {
        uint256 totalRequests;
        uint256 successfulVerifications;
        uint256 failedVerifications;
        uint256 pendingRequests;
        uint256 lastRequestTime;
        bool isRateLimited;
    }

    struct ContractStats {
        uint256 totalRequests;
        uint256 totalVerified;
        uint256 totalFailed;
        uint256 totalFeesCollected;
        uint256 activeOracles;
        bool isPaused;
    }

    // Events for backend monitoring
    event VerificationRequested(
        bytes32 indexed requestId,
        address indexed requester,
        string prompt,
        string model,
        uint256 feePaid,
        uint256 timestamp
    );

    event VerificationFulfilled(
        bytes32 indexed requestId,
        bytes32 indexed attestationId,
        bytes32 outputHash,
        address indexed oracle,
        uint256 timestamp
    );

    event VerificationFailed(
        bytes32 indexed requestId,
        string reason,
        address indexed oracle,
        uint256 timestamp
    );

    event VerificationExpired(
        bytes32 indexed requestId,
        address indexed requester,
        uint256 expiredAt
    );

    event NFTMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        bytes32 indexed requestId,
        string tokenURI
    );

    event VerificationFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryAddressUpdated(address oldTreasury, address newTreasury);
    event NFTContractUpdated(address oldContract, address newContract);
    event OracleStatusChanged(address indexed oracle, bool isActive);
    event EmergencyAction(string action, address admin, string reason);

    // ========================================================================
    // BACKEND SERVICE FUNCTIONS
    // ========================================================================

    /**
     * @dev Request verification (called by backend service only)
     * @param requester The user's wallet address
     * @param prompt The AI prompt to verify
     * @param model The AI model used
     * @return requestId Unique identifier for the request
     */
    function requestVerification(
        address requester,
        string calldata prompt,
        string calldata model
    ) external payable returns (bytes32 requestId);

    /**
     * @dev Fulfill verification with AI result (called by oracle/backend)
     * @param requestId The request to fulfill
     * @param output The AI generated output
     * @param attestationId Oracle attestation identifier
     * @param proof Cryptographic proof of verification
     */
    function fulfillVerification(
        bytes32 requestId,
        string calldata output,
        bytes32 attestationId,
        bytes calldata proof
    ) external;

    /**
     * @dev Mark verification as failed (called by oracle/backend)
     * @param requestId The failed request
     * @param reason Failure reason
     */
    function markVerificationFailed(
        bytes32 requestId,
        string calldata reason
    ) external;

    /**
     * @dev Batch fulfill multiple verifications (backend optimization)
     */
    function batchFulfillVerifications(
        bytes32[] calldata requestIds,
        string[] calldata outputs,
        bytes32[] calldata attestationIds,
        bytes[] calldata proofs
    ) external;

    /**
     * @dev Expire old pending requests (backend cleanup)
     */
    function expireRequest(bytes32 requestId) external;

    // ========================================================================
    // BACKEND QUERY FUNCTIONS
    // ========================================================================

    /**
     * @dev Get verification request details
     */
    function getVerificationRequest(
        bytes32 requestId
    ) external view returns (VerificationRequest memory);

    /**
     * @dev Verify if output matches request
     */
    function verifyOutput(
        bytes32 requestId,
        string calldata output
    ) external view returns (bool);

    /**
     * @dev Get user statistics for backend
     */
    function getUserStats(
        address user
    ) external view returns (UserStats memory);

    /**
     * @dev Get all user requests with pagination
     */
    function getUserRequests(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory requestIds);

    /**
     * @dev Get requests by status (for backend filtering)
     */
    function getRequestsByStatus(
        VerificationStatus status,
        uint256 offset,
        uint256 limit
    ) external view returns (bytes32[] memory);

    /**
     * @dev Get pending requests for oracle processing
     */
    function getPendingRequests(
        uint256 maxAge
    ) external view returns (bytes32[] memory);

    /**
     * @dev Check if user can make new request (rate limiting)
     */
    function canUserMakeRequest(
        address user
    )
        external
        view
        returns (bool canRequest, uint256 waitTime, uint256 dailyRemaining);

    /**
     * @dev Get contract statistics for backend monitoring
     */
    function getContractStats() external view returns (ContractStats memory);

    /**
     * @dev Get current fee (including dynamic pricing)
     */
    function getCurrentVerificationFee() external view returns (uint256);

    /**
     * @dev Calculate fee for specific user (potential discounts)
     */
    function calculateFeeForUser(address user) external view returns (uint256);

    // ========================================================================
    // BACKEND INTEGRATION HELPERS
    // ========================================================================

    /**
     * @dev Encode request data for oracle
     */
    function encodeRequestData(
        string calldata prompt,
        string calldata model,
        address requester
    ) external pure returns (bytes memory);

    /**
     * @dev Decode oracle response data
     */
    function decodeOracleResponse(
        bytes calldata data
    )
        external
        pure
        returns (string memory output, bytes32 outputHash, bool isValid);

    /**
     * @dev Get contract version for backend compatibility
     */
    function getContractVersion() external pure returns (string memory);

    /**
     * @dev Health check for backend monitoring
     */
    function healthCheck()
        external
        view
        returns (bool isHealthy, string memory status, uint256 timestamp);

    // ========================================================================
    // ADMIN FUNCTIONS (Backend Admin API)
    // ========================================================================

    function setVerificationFee(uint256 _fee) external;
    function setTreasuryAddress(address _treasury) external;
    function setNFTContract(address _nftContract) external;
    function setOracleRelayer(address _oracleRelayer) external;
    function addOracle(address _oracle) external;
    function removeOracle(address _oracle) external;
    function pause() external;
    function unpause() external;
    function emergencyWithdraw() external;

    // View functions for admin
    function getTreasuryAddress() external view returns (address);
    function getNFTContract() external view returns (address);
    function getOracleRelayer() external view returns (address);
    function isPaused() external view returns (bool);
    function getOracleCount() external view returns (uint256);
    function isOracle(address oracle) external view returns (bool);
}
