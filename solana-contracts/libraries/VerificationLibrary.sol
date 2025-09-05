// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VerificationLibrary - Solana Compatible
 * @dev Library containing utility functions for AI content verification
 * Adapted from original VeriAI with Solana compatibility
 * @author VeriAI Team - Solana Migration
 */
library VerificationLibrary {
    // Constants
    uint256 public constant MIN_VERIFICATION_FEE = 0.001 ether; // 0.001 SOL
    uint256 public constant MAX_VERIFICATION_FEE = 1 ether; // 1 SOL
    uint256 public constant MAX_PROMPT_LENGTH = 2000;
    uint256 public constant MAX_MODEL_LENGTH = 50;
    uint256 public constant RATE_LIMIT_WINDOW = 60 seconds;
    uint256 public constant MAX_DAILY_REQUESTS = 100;
    uint256 public constant REQUEST_TIMEOUT = 24 hours;

    // Error messages
    string internal constant INVALID_FEE_MSG = "Invalid fee amount";
    string internal constant INVALID_PROMPT_MSG = "Invalid prompt length";
    string internal constant INVALID_MODEL_MSG = "Invalid model length";
    string internal constant RATE_LIMIT_MSG = "Rate limit exceeded";
    string internal constant DAILY_LIMIT_MSG = "Daily limit exceeded";
    string internal constant REQUEST_EXPIRED_MSG = "Request expired";

    /**
     * @dev Validates verification fee is within acceptable range
     * @param fee The fee amount to validate
     */
    function validateFee(uint256 fee) internal pure {
        require(
            fee >= MIN_VERIFICATION_FEE && fee <= MAX_VERIFICATION_FEE,
            INVALID_FEE_MSG
        );
    }

    /**
     * @dev Validates prompt and model parameters
     * @param prompt The AI prompt to validate
     * @param model The AI model to validate
     */
    function validateVerificationInput(
        string memory prompt,
        string memory model
    ) internal pure {
        require(
            bytes(prompt).length > 0 &&
                bytes(prompt).length <= MAX_PROMPT_LENGTH,
            INVALID_PROMPT_MSG
        );
        require(
            bytes(model).length > 0 && bytes(model).length <= MAX_MODEL_LENGTH,
            INVALID_MODEL_MSG
        );
    }

    /**
     * @dev Checks if rate limit is exceeded for a user
     * @param lastRequestTime The user's last request timestamp
     * @param currentTime Current block timestamp
     */
    function checkRateLimit(
        uint256 lastRequestTime,
        uint256 currentTime
    ) internal pure returns (bool) {
        return currentTime >= lastRequestTime + RATE_LIMIT_WINDOW;
    }

    /**
     * @dev Checks if daily request limit is exceeded
     * @param dailyCount Current daily request count
     */
    function checkDailyLimit(uint256 dailyCount) internal pure returns (bool) {
        return dailyCount < MAX_DAILY_REQUESTS;
    }

    /**
     * @dev Generates unique request ID
     * @param requester The address making the request
     * @param prompt The verification prompt
     * @param model The AI model
     * @param timestamp Current timestamp
     * @param nonce Additional nonce for uniqueness
     */
    function generateRequestId(
        address requester,
        string memory prompt,
        string memory model,
        uint256 timestamp,
        uint256 nonce
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(requester, prompt, model, timestamp, nonce)
            );
    }

    /**
     * @dev Validates attestation data
     * @param attestationId The attestation ID to validate
     * @param proof The cryptographic proof
     */
    function validateAttestation(
        bytes32 attestationId,
        bytes memory proof
    ) internal pure {
        require(attestationId != bytes32(0), "Invalid attestation ID");
        require(proof.length > 0, "Invalid proof");
    }

    /**
     * @dev Calculates output hash for verification
     * @param output The AI output to hash
     */
    function calculateOutputHash(
        string memory output
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(output));
    }

    /**
     * @dev Checks if request has expired
     * @param requestTime The request timestamp
     * @param currentTime Current block timestamp
     */
    function isRequestExpired(
        uint256 requestTime,
        uint256 currentTime
    ) internal pure returns (bool) {
        return currentTime > requestTime + REQUEST_TIMEOUT;
    }

    /**
     * @dev Formats address for display (utility function)
     * @param addr The address to format
     * @param chars Number of characters to show from start/end
     */
    function formatAddress(
        address addr,
        uint256 chars
    ) internal pure returns (string memory) {
        bytes memory addrBytes = abi.encodePacked(addr);
        bytes memory result = new bytes(chars * 2);

        for (uint256 i = 0; i < chars && i < 20; i++) {
            uint8 b = uint8(addrBytes[i]);
            result[i * 2] = _char(b / 16);
            result[i * 2 + 1] = _char(b % 16);
        }

        return string(result);
    }

    /**
     * @dev Converts timestamp to day index for daily tracking
     * @param timestamp The timestamp to convert
     * @param deploymentTime Contract deployment timestamp
     */
    function timestampToDay(
        uint256 timestamp,
        uint256 deploymentTime
    ) internal pure returns (uint256) {
        require(timestamp >= deploymentTime, "Invalid timestamp");
        return (timestamp - deploymentTime) / 86400; // 24 hours in seconds
    }

    function _char(uint8 b) private pure returns (bytes1 c) {
        if (b < 10) return bytes1(b + 0x30);
        else return bytes1(b + 0x57);
    }

    // New helper functions for backend integration
    function encodeVerificationData(
        string memory prompt,
        string memory model,
        address requester,
        uint256 timestamp
    ) internal pure returns (bytes memory) {
        return abi.encode(prompt, model, requester, timestamp);
    }

    function decodeVerificationData(
        bytes memory data
    )
        internal
        pure
        returns (
            string memory prompt,
            string memory model,
            address requester,
            uint256 timestamp
        )
    {
        return abi.decode(data, (string, string, address, uint256));
    }

    function validateBatchInputs(
        bytes32[] memory requestIds,
        string[] memory outputs
    ) internal pure {
        require(requestIds.length == outputs.length, "Array length mismatch");
        require(requestIds.length > 0, "Empty arrays");
        require(requestIds.length <= 50, "Batch too large"); // Prevent gas issues
    }
}
