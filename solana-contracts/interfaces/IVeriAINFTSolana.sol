// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IVeriAINFTSolana - Solana Compatible
 * @dev Interface for VeriAI NFT verification certificates on Solana
 * @author VeriAI Team - Solana Migration
 */
interface IVeriAINFTSolana {
    // Structs
    struct VerificationMetadata {
        string prompt;
        string model;
        string outputHash;
        uint64 timestamp;
        bytes32 proofHash;
        bool verified;
        address verifier;
        bytes32 requestId;
    }

    // Events
    event VerificationNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 indexed requestId,
        string model
    );

    event MetadataUpdated(uint256 indexed tokenId, string newMetadata);

    // Core functions
    function mintVerificationNFT(
        address recipient,
        VerificationMetadata memory metadata
    ) external returns (uint256 tokenId);

    function updateTokenMetadata(
        uint256 tokenId,
        string calldata newMetadata
    ) external;

    // View functions
    function getVerificationMetadata(
        uint256 tokenId
    ) external view returns (VerificationMetadata memory);

    function getTokensByOwner(
        address owner
    ) external view returns (uint256[] memory);

    function getTokensByModel(
        string calldata model
    ) external view returns (uint256[] memory);

    function isVerificationValid(uint256 tokenId) external view returns (bool);

    // Standard ERC721 functions
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
