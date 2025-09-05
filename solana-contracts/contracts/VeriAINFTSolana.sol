// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VeriAINFTSolana - Solana Compatible
 * @dev NFT contract for VeriAI verification certificates on Solana
 * Maintains all original functionality while being Solana-compatible
 * @author VeriAI Team - Solana Migration
 */

import "../interfaces/IVeriAINFTSolana.sol";

// ============================================================================
// ACCESS CONTROL (Reused from VeriAISolana)
// ============================================================================

contract AccessManager {
    mapping(bytes32 => mapping(address => bool)) private _roles;
    address private _admin;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");

    event RoleGranted(
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

    function getRoleAdmin(bytes32) public pure returns (bytes32) {
        return DEFAULT_ADMIN_ROLE;
    }

    function _grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msgSender());
        }
    }
}

// ============================================================================
// MAIN NFT CONTRACT
// ============================================================================

contract VeriAINFTSolana is AccessManager, IVeriAINFTSolana {
    // State variables
    uint256 private _tokenIdCounter;
    string private _name;
    string private _symbol;
    string private _baseTokenURI;

    // NFT mappings (ERC721-like for Solana)
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => VerificationMetadata) private _tokenMetadata;

    // Index mappings
    mapping(address => uint256[]) private _tokensByOwner;
    mapping(string => uint256[]) private _tokensByModel;

    // Events
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    // Custom errors
    error TokenNotFound();
    error NotTokenOwner();
    error InvalidMetadata();
    error ZeroAddress();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_,
        address _initialAdmin
    ) {
        require(_initialAdmin != address(0), "Invalid admin");

        _name = name_;
        _symbol = symbol_;
        _baseTokenURI = baseTokenURI_;

        initialize(_initialAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin);
        _grantRole(MINTER_ROLE, _initialAdmin);
        _grantRole(UPDATER_ROLE, _initialAdmin);
    }

    // ========================================================================
    // CORE NFT FUNCTIONS
    // ========================================================================

    function mintVerificationNFT(
        address recipient,
        VerificationMetadata memory metadata
    ) external override onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        require(recipient != address(0), "Invalid recipient");
        _validateMetadata(metadata);

        tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint token
        _mint(recipient, tokenId);

        // Set metadata
        _tokenMetadata[tokenId] = metadata;

        // Generate and set token URI
        string memory uri = _generateTokenURI(metadata);
        _setTokenURI(tokenId, uri);

        // Update indices
        _tokensByOwner[recipient].push(tokenId);
        _tokensByModel[metadata.model].push(tokenId);

        return tokenId;
    }

    function updateTokenMetadata(
        uint256 tokenId,
        string calldata newMetadata
    ) external override onlyRole(UPDATER_ROLE) {
        if (!_exists(tokenId)) revert TokenNotFound();

        _tokenURIs[tokenId] = newMetadata;
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter;
    }

    function balanceOf(address owner) public view override returns (uint256) {
        require(owner != address(0), "Invalid owner");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        if (owner == address(0)) revert TokenNotFound();
        return owner;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenNotFound();
        return _tokenURIs[tokenId];
    }

    function getVerificationMetadata(
        uint256 tokenId
    ) external view override returns (VerificationMetadata memory) {
        if (!_exists(tokenId)) revert TokenNotFound();
        return _tokenMetadata[tokenId];
    }

    function getTokensByOwner(
        address owner
    ) external view override returns (uint256[] memory) {
        return _tokensByOwner[owner];
    }

    function getTokensByModel(
        string calldata model
    ) external view override returns (uint256[] memory) {
        return _tokensByModel[model];
    }

    function isVerificationValid(
        uint256 tokenId
    ) external view override returns (bool) {
        if (!_exists(tokenId)) return false;
        VerificationMetadata memory metadata = _tokenMetadata[tokenId];

        // Check if verification is still valid (not expired)
        // 30 days validity period
        return
            metadata.verified &&
            (block.timestamp - metadata.timestamp) < 2592000;
    }

    // ========================================================================
    // INTERNAL FUNCTIONS
    // ========================================================================

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Invalid recipient");
        require(!_exists(tokenId), "Token already exists");

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), "Token does not exist");
        _tokenURIs[tokenId] = uri;
    }

    function _validateMetadata(
        VerificationMetadata memory metadata
    ) internal pure {
        require(bytes(metadata.prompt).length > 0, "Empty prompt");
        require(bytes(metadata.model).length > 0, "Empty model");
        require(bytes(metadata.outputHash).length > 0, "Empty output hash");
        require(metadata.timestamp > 0, "Invalid timestamp");
        require(metadata.requestId != bytes32(0), "Invalid request ID");
    }

    function _generateTokenURI(
        VerificationMetadata memory metadata
    ) internal view returns (string memory) {
        // Generate JSON metadata for the NFT
        return
            string(
                abi.encodePacked(
                    _baseTokenURI,
                    _toString(metadata.timestamp),
                    "?model=",
                    metadata.model,
                    "&verified=",
                    metadata.verified ? "true" : "false"
                )
            );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // ========================================================================
    // ADMIN FUNCTIONS
    // ========================================================================

    function setBaseTokenURI(
        string calldata newBaseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
    }

    function getBaseTokenURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    // Note: These are Soulbound tokens - no transfer functions implemented
    // This maintains the soulbound nature for verification certificates
}
