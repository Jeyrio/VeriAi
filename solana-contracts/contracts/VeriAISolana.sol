// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VeriAISolana - Solana Compatible
 * @dev Main verification contract for AI content verification on Solana
 * Maintains all original VeriAI functionality while being Solana-compatible
 * Uses Solang compiler for Solana deployment
 * @author VeriAI Team - Solana Migration
 */

import "../libraries/VerificationLibrary.sol";
import "../interfaces/IVeriAISolana.sol";
import "../interfaces/IVeriAINFTSolana.sol";

// ============================================================================
// ACCESS CONTROL (Solana Compatible)
// ============================================================================

contract AccessManager {
    mapping(bytes32 => mapping(address => bool)) private _roles;
    address private _admin;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    function initialize(address admin) public {
        require(_admin == address(0), "Already initialized");
        require(admin != address(0), "Invalid admin");
        _admin = admin;
    }

    function msgSender() internal view returns (address) {
        return _admin;
    }

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msgSender()), "Access denied");
        _;
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    function grantRole(
        bytes32 role,
        address account
    ) external onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function revokeRole(
        bytes32 role,
        address account
    ) external onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    function getRoleAdmin(bytes32) public pure returns (bytes32) {
        return DEFAULT_ADMIN_ROLE;
    }

    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msgSender());
        }
    }

    function _revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msgSender());
        }
    }
}

contract PausableManager is AccessManager {
    bool private _paused;

    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!_paused, "Contract paused");
        _;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _paused = true;
        emit Paused(msgSender());
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _paused = false;
        emit Unpaused(msgSender());
    }
}

// ============================================================================
// UTILITIES (Solana Compatible)
// ============================================================================

contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// ============================================================================
// MAIN VERIAI SOLANA CONTRACT
// ============================================================================

contract VeriAISolana is PausableManager, ReentrancyGuard, IVeriAISolana {
    using VerificationLibrary for uint256;
    using VerificationLibrary for string;

    // State variables
    uint256 private _requestCounter;
    uint256 private _verificationFee;
    address private _treasuryAddress;
    IVeriAINFTSolana private _nftContract;
    uint256 public immutable DEPLOYMENT_TIME;

    // Add these state variables
    mapping(address => uint256) private _successfulVerifications;
    mapping(address => uint256) private _failedVerifications;
    uint256 private _totalFeesCollected;
    uint256 private _activeOracleCount;

    // Verification requests
    mapping(bytes32 => VerificationRequest) private _requests;
    mapping(address => bytes32[]) private _userRequests;
    mapping(address => uint256) private _requestCount;

    // Rate limiting
    mapping(address => uint256) private _lastRequestTime;
    mapping(address => mapping(uint256 => uint256)) private _dailyRequestCount;

    // Oracles
    mapping(address => OracleData) private _oracles;
    mapping(bytes32 => bool) private _processedAttestations;

    // Statistics
    uint256 private _totalRequests;
    uint256 private _totalVerified;
    uint256 private _totalFailed;

    // Oracle integration
    ISolanaOracleRelayer private _oracleRelayer;

    // Custom errors
    error InvalidPromptLength();
    error InvalidModelLength();
    error InsufficientFee();
    error RateLimitExceeded();
    error DailyLimitExceeded();
    error InvalidTreasuryAddress();
    error InvalidNFTContract();
    error RequestNotFound();
    error RequestAlreadyVerified();
    error RequestExpired();
    error AttestationAlreadyProcessed();
    error UnauthorizedOracle();
    error ZeroAddress();
    error TransferFailed();

    constructor(
        uint256 _initialFee,
        address _treasury,
        address _admin,
        address _oracleRelayer
    ) {
        require(_treasury != address(0), "Invalid treasury");
        require(_admin != address(0), "Invalid admin");
        require(_oracleRelayer != address(0), "Invalid oracle relayer");

        _verificationFee = _initialFee;
        _treasuryAddress = _treasury;
        _oracleRelayer = ISolanaOracleRelayer(_oracleRelayer);
        DEPLOYMENT_TIME = block.timestamp;

        initialize(_admin);
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ORACLE_ROLE, _admin);
        _grantRole(FEE_MANAGER_ROLE, _admin);
    }

    // ========================================================================
    // CORE VERIFICATION FUNCTIONS
    // ========================================================================

    /**
     * @dev Request AI content verification with oracle integration
     * @param prompt The AI prompt to verify
     * @param model The AI model used
     * @return requestId The unique request identifier
     */
    function requestVerification(
        string calldata prompt,
        string calldata model
    )
        external
        payable
        override
        whenNotPaused
        nonReentrant
        returns (bytes32 requestId)
    {
        // Validate inputs
        VerificationLibrary.validateVerificationInput(prompt, model);

        // Get current SOL price and calculate fee
        uint256 requiredFee = _calculateDynamicFee();
        require(msg.value >= requiredFee, "Insufficient fee");

        // Rate limiting
        require(
            VerificationLibrary.checkRateLimit(
                _lastRequestTime[msgSender()],
                block.timestamp
            ),
            "Rate limit exceeded"
        );

        // Daily limit check
        uint256 currentDay = VerificationLibrary.timestampToDay(
            block.timestamp,
            DEPLOYMENT_TIME
        );
        require(
            VerificationLibrary.checkDailyLimit(
                _dailyRequestCount[msgSender()][currentDay]
            ),
            "Daily limit exceeded"
        );

        // Generate request ID
        requestId = VerificationLibrary.generateRequestId(
            msgSender(),
            prompt,
            model,
            block.timestamp,
            _requestCounter
        );

        // Create verification request
        _requests[requestId] = VerificationRequest({
            requester: msgSender(),
            prompt: prompt,
            model: model,
            timestamp: uint64(block.timestamp),
            status: VerificationStatus.Pending,
            outputHash: bytes32(0),
            attestationId: bytes32(0),
            feePaid: msg.value,
            nftMinted: false
        });

        // Update tracking
        _userRequests[msgSender()].push(requestId);
        _requestCount[msgSender()]++;
        _lastRequestTime[msgSender()] = block.timestamp;
        _dailyRequestCount[msgSender()][currentDay]++;
        _requestCounter++;
        _totalRequests++;

        // Prepare verification data for oracle
        bytes memory verificationData = abi.encode(
            prompt,
            model,
            msgSender(),
            block.timestamp
        );

        // Request attestation from oracle
        bytes32 attestationId = _oracleRelayer.requestAttestation(
            requestId,
            verificationData
        );
        _requests[requestId].attestationId = attestationId;

        // Transfer fee to treasury
        (bool success, ) = _treasuryAddress.call{value: msg.value}("");
        require(success, "Fee transfer failed");

        emit VerificationRequested(
            requestId,
            msgSender(),
            prompt,
            model,
            msg.value
        );
        return requestId;
    }

    /**
     * @dev Request verification (backend service calls this)
     * @param requester The user's wallet address (from backend)
     * @param prompt The AI prompt to verify
     * @param model The AI model used
     */
    function requestVerification(
        address requester,
        string calldata prompt,
        string calldata model
    ) external payable override whenNotPaused nonReentrant onlyRole(ORACLE_ROLE) returns (bytes32 requestId) {
        require(requester != address(0), "Invalid requester");
        
        // Validate inputs
        VerificationLibrary.validateVerificationInput(prompt, model);
        
        // Calculate required fee
        uint256 requiredFee = _calculateDynamicFee();
        require(msg.value >= requiredFee, "Insufficient fee");
        
        // Check rate limiting for the user
        require(
            VerificationLibrary.checkRateLimit(_lastRequestTime[requester], block.timestamp),
            "Rate limit exceeded"
        );
        
        // Check daily limit
        uint256 currentDay = VerificationLibrary.timestampToDay(block.timestamp, DEPLOYMENT_TIME);
        require(
            VerificationLibrary.checkDailyLimit(_dailyRequestCount[requester][currentDay]),
            "Daily limit exceeded"
        );
        
        // Generate request ID
        requestId = VerificationLibrary.generateRequestId(
            requester,
            prompt,
            model,
            block.timestamp,
            _requestCounter
        );
        
        // Create verification request
        _requests[requestId] = VerificationRequest({
            requester: requester,
            prompt: prompt,
            model: model,
            timestamp: uint64(block.timestamp),
            status: VerificationStatus.Pending,
            outputHash: bytes32(0),
            attestationId: bytes32(0),
            feePaid: msg.value,
            nftMinted: false
        });
        
        // Update tracking for the actual user (not msg.sender)
        _userRequests[requester].push(requestId);
        _requestCount[requester]++;
        _lastRequestTime[requester] = block.timestamp;
        _dailyRequestCount[requester][currentDay]++;
        _requestCounter++;
        _totalRequests++;
        
        // Prepare verification data for oracle
        bytes memory verificationData = VerificationLibrary.encodeVerificationData(
            prompt,
            model,
            requester,
            block.timestamp
        );
        
        // Request attestation from oracle
        bytes32 attestationId = _oracleRelayer.requestAttestation(requestId, verificationData);
        _requests[requestId].attestationId = attestationId;
        
        // Transfer fee to treasury
        (bool success, ) = _treasuryAddress.call{value: msg.value}("");
        require(success, "Fee transfer failed");
        
        emit VerificationRequested(requestId, requester, prompt, model, msg.value, block.timestamp);
        return requestId;
    }

    /**
     * @dev Calculate dynamic fee based on SOL/USD price
     * @return fee The calculated fee in SOL lamports
     */
    function _calculateDynamicFee() internal view returns (uint256 fee) {
        try _oracleRelayer.getSOLUSDPrice() returns (
            int64 solPrice,
            uint64 timestamp
        ) {
            // Check if price is recent (within 1 hour)
            if (block.timestamp - timestamp > 3600) {
                return _verificationFee; // Fallback to static fee
            }

            // Calculate fee: $1 USD equivalent in SOL
            uint256 usdFeeInCents = 100; // $1.00 USD
            return _oracleRelayer.calculateSOLFee(usdFeeInCents * 1e6); // Scale to 1e8
        } catch {
            return _verificationFee; // Fallback to static fee
        }
    }

    /**
     * @dev Fulfill verification with oracle result
     * @param requestId The request to fulfill
     * @param output The AI output result
     * @param attestationId The oracle attestation ID
     * @param proof Cryptographic proof from oracle
     */
    function fulfillVerification(
        bytes32 requestId,
        string calldata output,
        bytes32 attestationId,
        bytes calldata proof
    ) external override onlyRole(ORACLE_ROLE) {
        VerificationRequest storage request = _requests[requestId];
        require(request.requester != address(0), "Request not found");
        require(
            request.status == VerificationStatus.Pending,
            "Request already fulfilled"
        );

        // Verify attestation with oracle
        require(
            _oracleRelayer.verifyAttestation(attestationId),
            "Invalid attestation"
        );

        // Validate attestation matches request
        require(request.attestationId == attestationId, "Attestation mismatch");

        // Check if request has expired
        require(
            !VerificationLibrary.isRequestExpired(
                request.timestamp,
                block.timestamp
            ),
            "Request expired"
        );

        // Calculate output hash
        bytes32 outputHash = VerificationLibrary.calculateOutputHash(output);

        // Update request
        request.status = VerificationStatus.Verified;
        request.outputHash = outputHash;
        _totalVerified++;

        // Mint NFT certificate
        _mintVerificationNFT(
            request.requester,
            requestId,
            request,
            outputHash,
            proof
        );

        emit VerificationFulfilled(
            requestId,
            attestationId,
            outputHash,
            msgSender()
        );
    }

    /**
     * @dev Mark verification as failed
     * @param requestId The request that failed
     * @param reason The failure reason
     */
    function markVerificationFailed(
        bytes32 requestId,
        string calldata reason
    ) external override onlyRole(ORACLE_ROLE) {
        VerificationRequest storage request = _requests[requestId];
        require(request.requester != address(0), "Request not found");
        require(
            request.status == VerificationStatus.Pending,
            "Request already processed"
        );

        request.status = VerificationStatus.Failed;
        _totalFailed++;

        emit VerificationFailed(requestId, reason, msgSender());
    }

    /**
     * @dev Update oracle relayer address
     * @param newOracleRelayer The new oracle relayer address
     */
    function setOracleRelayer(
        address newOracleRelayer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newOracleRelayer != address(0), "Invalid oracle relayer");
        _oracleRelayer = ISolanaOracleRelayer(newOracleRelayer);
        emit OracleRelayerUpdated(newOracleRelayer);
    }

    /**
     * @dev Get oracle relayer address
     * @return The current oracle relayer address
     */
    function getOracleRelayer() external view returns (address) {
        return address(_oracleRelayer);
    }

    /**
     * @dev Get current verification fee (dynamic)
     * @return The current fee in SOL lamports
     */
    function getCurrentVerificationFee() external view returns (uint256) {
        return _calculateDynamicFee();
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    function getVerificationRequest(
        bytes32 requestId
    ) external view override returns (VerificationRequest memory) {
        return _requests[requestId];
    }

    function verifyOutput(
        bytes32 requestId,
        string calldata output
    ) external view override returns (bool) {
        VerificationRequest memory request = _requests[requestId];
        if (request.status != VerificationStatus.Verified) return false;

        bytes32 outputHash = VerificationLibrary.calculateOutputHash(output);
        return outputHash == request.outputHash;
    }

    function getUserRequestCount(
        address user
    ) external view override returns (uint256) {
        return _requestCount[user];
    }

    function getUserRequests(
        address user
    ) external view override returns (bytes32[] memory) {
        return _userRequests[user];
    }

    function getVerificationFee() external view override returns (uint256) {
        return _verificationFee;
    }

    function getTreasuryAddress() external view override returns (address) {
        return _treasuryAddress;
    }

    function getNFTContract() external view override returns (address) {
        return address(_nftContract);
    }

    function getOracleData(
        address oracle
    ) external view returns (OracleData memory) {
        return _oracles[oracle];
    }

    function isAttestationProcessed(
        bytes32 attestationId
    ) external view returns (bool) {
        return _processedAttestations[attestationId];
    }

    function getContractStats()
        external
        view
        returns (
            uint256 totalRequests,
            uint256 totalVerified,
            uint256 totalFailed
        )
    {
        return (_totalRequests, _totalVerified, _totalFailed);
    }

    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================

    function setVerificationFee(
        uint256 _fee
    ) external override onlyRole(FEE_MANAGER_ROLE) {
        VerificationLibrary.validateFee(_fee);
        _verificationFee = _fee;
        emit VerificationFeeUpdated(_fee);
    }

    function setTreasuryAddress(
        address _treasury
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_treasury == address(0)) revert InvalidTreasuryAddress();
        _treasuryAddress = _treasury;
        emit TreasuryAddressUpdated(_treasury);
    }

    function setNFTContract(
        address _nftContractAddress
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_nftContractAddress == address(0)) revert InvalidNFTContract();
        _nftContract = IVeriAINFTSolana(_nftContractAddress);
        emit NFTContractUpdated(_nftContractAddress);
    }

    function addOracle(
        address _oracle
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_oracle == address(0)) revert ZeroAddress();

        _grantRole(ORACLE_ROLE, _oracle);
        _oracles[_oracle] = OracleData({
            oracle: _oracle,
            isActive: true,
            successfulVerifications: 0,
            failedVerifications: 0,
            lastActivity: uint64(block.timestamp)
        });

        emit OracleAdded(_oracle);
    }

    function removeOracle(
        address _oracle
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ORACLE_ROLE, _oracle);
        _oracles[_oracle].isActive = false;
        emit OracleRemoved(_oracle);
    }

    // ========================================================================
    // INTERNAL FUNCTIONS
    // ========================================================================

    function _checkRateLimits(address user) internal view {
        // Check time-based rate limit
        if (
            !VerificationLibrary.checkRateLimit(
                _lastRequestTime[user],
                block.timestamp
            )
        ) {
            revert RateLimitExceeded();
        }

        // Check daily limit
        uint256 currentDay = VerificationLibrary.timestampToDay(
            block.timestamp,
            DEPLOYMENT_TIME
        );
        if (
            !VerificationLibrary.checkDailyLimit(
                _dailyRequestCount[user][currentDay]
            )
        ) {
            revert DailyLimitExceeded();
        }
    }

    function _updateUserTracking(address user, bytes32 requestId) internal {
        _lastRequestTime[user] = block.timestamp;
        _requestCount[user]++;

        uint256 currentDay = VerificationLibrary.timestampToDay(
            block.timestamp,
            DEPLOYMENT_TIME
        );
        _dailyRequestCount[user][currentDay]++;

        _userRequests[user].push(requestId);
    }

    function _transferFees(uint256 amount) internal {
        // Note: In actual Solana implementation, this would use lamport transfers
        // For Solang compilation, we use the Ethereum pattern
        (bool success, ) = payable(_treasuryAddress).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    function _validateFulfillmentRequest(
        VerificationRequest storage request,
        bytes32 attestationId
    ) internal view {
        if (request.timestamp == 0) revert RequestNotFound();
        if (request.status != VerificationStatus.Pending)
            revert RequestAlreadyVerified();
        if (
            VerificationLibrary.isRequestExpired(
                request.timestamp,
                block.timestamp
            )
        ) revert RequestExpired();
        if (_processedAttestations[attestationId])
            revert AttestationAlreadyProcessed();
    }

    function _mintVerificationNFT(
        address recipient,
        bytes32 requestId,
        VerificationRequest storage request,
        bytes32 outputHash,
        bytes memory proof
    ) internal {
        bytes32 proofHash = keccak256(proof);

        IVeriAINFTSolana.VerificationMetadata memory metadata = IVeriAINFTSolana
            .VerificationMetadata({
                prompt: request.prompt,
                model: request.model,
                outputHash: string(abi.encodePacked(outputHash)),
                timestamp: request.timestamp,
                proofHash: proofHash,
                verified: true,
                verifier: msgSender(),
                requestId: requestId
            });

        uint256 tokenId = _nftContract.mintVerificationNFT(recipient, metadata);
        request.nftMinted = true;

        emit NFTMinted(recipient, tokenId, requestId);
    }

    // ========================================================================
    // EMERGENCY FUNCTIONS
    // ========================================================================

    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            _transferFees(balance);
        }
    }

    // ========================================================================
    // RECEIVE FUNCTION
    // ========================================================================

    receive() external payable {
        // Accept SOL payments for verification fees
    }
