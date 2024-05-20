// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "./ERC1155/ERC1155.sol";
import {Owned} from "./Owned.sol";

/// @title Soulbound ERC1155 Tokens
/// @notice Implements non-transferable ERC1155 tokens under the management of an owner.
/// @dev Extends ERC1155 for multi-token functionality and Owned for access control.
abstract contract Soulbound is ERC1155, Owned {
    /// @notice Name of the token collection.
    string public name;

    /// @notice Symbol of the token collection.
    string public symbol;

    /// @dev Initializes the ERC1155 token with a name and symbol, and sets the contract deployer as the owner.
    /// @param _name Name of the ERC1155 token collection.
    /// @param _symbol Symbol of the ERC1155 token collection.
    constructor(
        string memory _name,
        string memory _symbol
    ) payable ERC1155() Owned(msg.sender) {
        name = _name;
        symbol = _symbol;
    }

    /// @notice Mints a specified amount of tokens to a designated account.
    /// @dev Only the owner can mint new tokens.
    /// @param to The address of the recipient.
    /// @param tokenId The ID of the token to be minted.
    /// @param amount The amount of the specified token to mint.
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public onlyOwner {
        require(amount > 0, "ZERO_AMOUNT");
        _mint(to, tokenId, amount, "");
    }

    /// @notice Mints batches of tokens to a single recipient.
    /// @dev Only the owner can execute batch minting.
    /// @param to The address of the recipient receiving the tokens.
    /// @param tokenIds An array of token IDs to be minted.
    /// @param amounts An array of amounts for each token ID being minted.
    function batchMint(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external onlyOwner {
        _batchMint(to, tokenIds, amounts, "");
    }

    /// @notice Sets or updates the metadata URI for a specific token ID.
    /// @dev Only the contract owner can call this function to set or update the URI associated with a given token ID.
    /// This allows for dynamic metadata updates post-minting, which can be essential for certain applications of ERC1155 tokens.
    /// @param tokenId The ID of the token whose metadata URI is being set or updated.
    /// @param tokenURI The new metadata URI that will represent the token's metadata.
    function setURI(
        uint256 tokenId,
        string memory tokenURI
    ) external onlyOwner {
        _setURI(tokenId, tokenURI);
    }

    /// @notice Burns a specific amount of a token from a given address.
    /// @dev Only the owner of the contract can call this function.
    /// @param from The address from which tokens will be burned.
    /// @param tokenId The ID of the token to burn.
    /// @param amount The amount of the token to be burned.
    function burn(
        address from,
        uint256 tokenId,
        uint256 amount
    ) external onlyOwner {
        _burn(from, tokenId, amount);
    }

    /// @notice Burns multiple tokens with varying amounts from a given address.
    /// @dev Only the owner of the contract can call this function.
    /// @param from The address from which tokens will be burned.
    /// @param tokenIds An array of token IDs to burn.
    /// @param amounts An array of amounts corresponding to each token ID to be burned.
    function batchBurn(
        address from,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external onlyOwner {
        _batchBurn(from, tokenIds, amounts);
    }
}
