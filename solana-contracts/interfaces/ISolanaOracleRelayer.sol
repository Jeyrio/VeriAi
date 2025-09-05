// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISolanaOracleRelayer {
    struct AttestationRequest {
        address requester;
        bytes data;
        uint256 timestamp;
        bool fulfilled;
        bytes32 attestationId;
    }

    // Core oracle functions
    function requestAttestation(
        bytes32 requestId,
        bytes calldata verificationData
    ) external returns (bytes32 attestationId);

    function fulfillAttestation(
        bytes32 requestId,
        bytes calldata result,
        bytes calldata proof
    ) external;

    // Pyth price feed functions
    function getSOLUSDPrice()
        external
        view
        returns (int64 price, uint64 timestamp);
    function updatePriceFeeds(bytes[] calldata updateData) external payable;
    function calculateSOLFee(
        uint256 usdFee
    ) external view returns (uint256 solFee);

    // Verification functions
    function verifyAttestation(
        bytes32 attestationId
    ) external view returns (bool valid);
    function getAttestationRequest(
        bytes32 requestId
    ) external view returns (AttestationRequest memory);

    // Switchboard functions
    function getSwitchboardData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 timestamp);

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
}
