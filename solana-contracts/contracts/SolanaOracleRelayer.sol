// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SolanaOracleRelayer - FDC Equivalent for Solana
 * @dev Oracle integration for AI verification using Switchboard and Pyth
 * Replaces Flare Data Connector functionality
 * @author VeriAI Team - Solana Migration
 */

import "../interfaces/ISolanaOracleRelayer.sol";

// Pyth Network interface for price feeds
interface IPythPriceFeeds {
    function getPrice(
        bytes32 priceId
    ) external view returns (int64 price, uint64 timestamp);
    function updatePriceFeeds(bytes[] calldata updateData) external payable;
}

// Switchboard Oracle interface for custom data
interface ISwitchboardOracle {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
    function requestData(
        bytes32 requestId,
        bytes calldata requestData
    ) external;
}

contract SolanaOracleRelayer is ISolanaOracleRelayer {
    // Oracle addresses
    IPythPriceFeeds public immutable pythPriceFeeds;
    ISwitchboardOracle public immutable switchboardOracle;

    // Price feed IDs (Pyth)
    bytes32 public constant SOL_USD_PRICE_ID =
        0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d;

    // Access control
    address private immutable owner;
    mapping(address => bool) public authorizedCallers;

    // Request tracking
    mapping(bytes32 => AttestationRequest) private requests;
    mapping(bytes32 => bool) private processedAttestations;

    // Events
    event AttestationRequested(
        bytes32 indexed requestId,
        address indexed requester,
        bytes data
    );
    event AttestationFulfilled(
        bytes32 indexed requestId,
        bytes32 attestationId,
        bytes result
    );
    event PriceFeedUpdated(bytes32 priceId, int64 price, uint64 timestamp);
    event OracleCallerAuthorized(address indexed caller);
    event OracleCallerRevoked(address indexed caller);

    // Errors
    error UnauthorizedCaller();
    error InvalidRequest();
    error RequestAlreadyProcessed();
    error InvalidPriceData();
    error OracleCallFailed();

    struct AttestationRequest {
        address requester;
        bytes data;
        uint256 timestamp;
        bool fulfilled;
        bytes32 attestationId;
    }

    modifier onlyAuthorized() {
        if (!authorizedCallers[msg.sender] && msg.sender != owner) {
            revert UnauthorizedCaller();
        }
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _pythPriceFeeds, address _switchboardOracle) {
        pythPriceFeeds = IPythPriceFeeds(_pythPriceFeeds);
        switchboardOracle = ISwitchboardOracle(_switchboardOracle);
        owner = msg.sender;
        authorizedCallers[msg.sender] = true;
    }

    /**
     * @dev Request AI verification attestation (replaces FDC functionality)
     * @param requestId Unique request identifier
     * @param verificationData Encoded verification parameters (prompt, model, etc.)
     * @return attestationId The attestation identifier
     */
    function requestAttestation(
        bytes32 requestId,
        bytes calldata verificationData
    ) external override onlyAuthorized returns (bytes32 attestationId) {
        if (requests[requestId].timestamp != 0) {
            revert RequestAlreadyProcessed();
        }

        // Generate attestation ID
        attestationId = keccak256(
            abi.encodePacked(
                requestId,
                msg.sender,
                verificationData,
                block.timestamp,
                block.number
            )
        );

        // Store request
        requests[requestId] = AttestationRequest({
            requester: msg.sender,
            data: verificationData,
            timestamp: block.timestamp,
            fulfilled: false,
            attestationId: attestationId
        });

        // Request data from Switchboard oracle
        switchboardOracle.requestData(requestId, verificationData);

        emit AttestationRequested(requestId, msg.sender, verificationData);
        return attestationId;
    }

    /**
     * @dev Fulfill attestation with verification result
     * @param requestId The original request ID
     * @param result The verification result data
     * @param proof Cryptographic proof of verification
     */
    function fulfillAttestation(
        bytes32 requestId,
        bytes calldata result,
        bytes calldata proof
    ) external override onlyAuthorized {
        AttestationRequest storage request = requests[requestId];

        if (request.timestamp == 0) {
            revert InvalidRequest();
        }

        if (request.fulfilled) {
            revert RequestAlreadyProcessed();
        }

        // Validate proof (basic validation - can be enhanced)
        require(proof.length > 0, "Invalid proof");

        // Mark as fulfilled
        request.fulfilled = true;
        processedAttestations[request.attestationId] = true;

        emit AttestationFulfilled(requestId, request.attestationId, result);
    }

    /**
     * @dev Get SOL/USD price from Pyth
     * @return price The SOL price in USD (scaled by 1e8)
     * @return timestamp The price timestamp
     */
    function getSOLUSDPrice()
        external
        view
        override
        returns (int64 price, uint64 timestamp)
    {
        return pythPriceFeeds.getPrice(SOL_USD_PRICE_ID);
    }

    /**
     * @dev Update Pyth price feeds
     * @param updateData Pyth price update data
     */
    function updatePriceFeeds(
        bytes[] calldata updateData
    ) external payable override {
        pythPriceFeeds.updatePriceFeeds{value: msg.value}(updateData);

        // Get updated price and emit event
        (int64 price, uint64 timestamp) = pythPriceFeeds.getPrice(
            SOL_USD_PRICE_ID
        );
        emit PriceFeedUpdated(SOL_USD_PRICE_ID, price, timestamp);
    }

    /**
     * @dev Calculate USD fee equivalent in SOL
     * @param usdFee Fee amount in USD (scaled by 1e8)
     * @return solFee Fee amount in SOL lamports
     */
    function calculateSOLFee(
        uint256 usdFee
    ) external view override returns (uint256 solFee) {
        (int64 solPrice, ) = pythPriceFeeds.getPrice(SOL_USD_PRICE_ID);

        if (solPrice <= 0) {
            revert InvalidPriceData();
        }

        // Convert USD to SOL: (usdFee * 1e18) / (solPrice * 1e10)
        // solPrice is scaled by 1e8, we want result in lamports (1e9)
        solFee = (usdFee * 1e18) / (uint256(uint64(solPrice)) * 1e10);
    }

    /**
     * @dev Verify if attestation is valid and processed
     * @param attestationId The attestation ID to verify
     * @return valid True if attestation is valid
     */
    function verifyAttestation(
        bytes32 attestationId
    ) external view override returns (bool valid) {
        return processedAttestations[attestationId];
    }

    /**
     * @dev Get attestation request details
     * @param requestId The request ID
     * @return request The attestation request data
     */
    function getAttestationRequest(
        bytes32 requestId
    ) external view override returns (AttestationRequest memory request) {
        return requests[requestId];
    }

    /**
     * @dev Get Switchboard oracle latest data
     * @return roundId Latest round ID
     * @return answer Latest answer
     * @return timestamp Latest update timestamp
     */
    function getSwitchboardData()
        external
        view
        override
        returns (uint80 roundId, int256 answer, uint256 timestamp)
    {
        (roundId, answer, , timestamp, ) = switchboardOracle.latestRoundData();
    }

    // Admin functions
    function authorizeOracleCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
        emit OracleCallerAuthorized(caller);
    }

    function revokeOracleCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
        emit OracleCallerRevoked(caller);
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Receive function for Pyth fee payments
    receive() external payable {}
}
