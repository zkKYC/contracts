// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

/// @title Minimalist and gas efficient standard ERC1155 implementation
/// @notice This contract provides a flexible and efficient implementation of the ERC1155 multi-token standard, including batch operations and URI management.
/// @author Solmate (https://github.com/transmissions11/solmate)
abstract contract ERC1155 {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when a single token is transferred, including minting and burning.
    /// @param operator The address which initiated the transfer.
    /// @param from The address which previously owned the token.
    /// @param to The address which received the token.
    /// @param id The identifier for an asset.
    /// @param amount The amount of tokens transferred.
    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 amount
    );

    /// @notice Emitted when multiple tokens are transferred, including minting and burning, in one operation.
    /// @param operator The address which initiated the batch transfer.
    /// @param from The address which previously owned the tokens.
    /// @param to The address which received the tokens.
    /// @param ids An array of token IDs.
    /// @param amounts An array of transfer amounts per token ID.
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] amounts
    );

    /// @notice Emitted when the URI for a token ID is set or updated.
    /// @param value The new URI string associated with the token.
    /// @param id The token ID that the URI is associated with.
    event URI(string value, uint256 indexed id);

    /*//////////////////////////////////////////////////////////////
                             ERC1155 STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Tracks the number of each token ID held by each address.
    mapping(address => mapping(uint256 => uint256)) public balanceOf;

    /*//////////////////////////////////////////////////////////////
                             METADATA LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice A private mapping of token IDs to their corresponding URIs.
    mapping(uint256 => string) private _tokenURIs;

    /// @notice Returns the URI for a token ID, if one is set.
    /// @param tokenId The token ID whose URI is being queried.
    /// @return The associated token URI or an empty string if none exists.
    function uri(uint256 tokenId) public view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    /// @notice Internally sets the URI for a token ID and emits a URI event.
    /// @dev This function should be called when URIs are updated or initially set.
    /// @param tokenId The token ID whose URI is being set.
    /// @param tokenURI The new URI string to associate with the specified token ID.
    function _setURI(uint256 tokenId, string memory tokenURI) internal virtual {
        _tokenURIs[tokenId] = tokenURI;
        emit URI(uri(tokenId), tokenId);
    }

    /*//////////////////////////////////////////////////////////////
                              ERC1155 LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Returns the balances of multiple token IDs for multiple owners.
    /// @param owners An array of owner addresses.
    /// @param ids An array of token IDs.
    /// @return balances An array containing the balance of each token for each owner.
    function balanceOfBatch(
        address[] calldata owners,
        uint256[] calldata ids
    ) public view virtual returns (uint256[] memory balances) {
        require(owners.length == ids.length, "LENGTH_MISMATCH");

        balances = new uint256[](owners.length);

        unchecked {
            for (uint256 i = 0; i < owners.length; ++i) {
                balances[i] = balanceOf[owners[i]][ids[i]];
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                              ERC165 LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Checks if the contract implements a specific interface.
    /// @param interfaceId The ID of the interface being queried.
    /// @return True if the contract implements the queried interface, false otherwise.
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165
            interfaceId == 0xd9b67a26 || // ERC1155
            interfaceId == 0x0e89341c; // ERC1155MetadataURI
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL MINT/BURN LOGIC
    //////////////////////////////////////////////////////////////*/

    /// @notice Mints a single token to a specified address.
    /// @param to The address receiving the minted token.
    /// @param id The token ID of the token being minted.
    /// @param amount The amount of the token to mint.
    /// @param data Additional data with no specified format, sent in call to recipient.
    function _mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        balanceOf[to][id] += amount;

        emit TransferSingle(msg.sender, address(0), to, id, amount);

        require(
            to.code.length == 0
                ? to != address(0)
                : ERC1155TokenReceiver(to).onERC1155Received(
                    msg.sender,
                    address(0),
                    id,
                    amount,
                    data
                ) == ERC1155TokenReceiver.onERC1155Received.selector,
            "UNSAFE_RECIPIENT"
        );
    }

    /// @notice Mints multiple tokens to a specified address in a single batch.
    /// @param to The address receiving the minted tokens.
    /// @param ids An array of token IDs to mint.
    /// @param amounts An array of quantities of each token to mint.
    /// @param data Additional data with no specified format, sent in call to recipient.
    function _batchMint(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        uint256 idsLength = ids.length; // Saves MLOADs.

        require(idsLength == amounts.length, "LENGTH_MISMATCH");

        for (uint256 i = 0; i < idsLength; ) {
            require(amounts[i] > 0, "ZERO_AMOUNT");
            balanceOf[to][ids[i]] += amounts[i];

            unchecked {
                ++i;
            }
        }

        emit TransferBatch(msg.sender, address(0), to, ids, amounts);

        require(
            to.code.length == 0
                ? to != address(0)
                : ERC1155TokenReceiver(to).onERC1155BatchReceived(
                    msg.sender,
                    address(0),
                    ids,
                    amounts,
                    data
                ) == ERC1155TokenReceiver.onERC1155BatchReceived.selector,
            "UNSAFE_RECIPIENT"
        );
    }

    /// @notice Internal function for batch burning multiple token types owned by a specific address.
    /// @dev Decreases the balance of each token ID by the corresponding amount in the provided arrays.
    /// @dev Reverts if the lengths of `ids` and `amounts` arrays are not equal.
    /// @param from Address of the token owner.
    /// @param ids Array containing the IDs of the tokens to be burned.
    /// @param amounts Array containing the amounts of tokens to be burned.
    function _batchBurn(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual {
        uint256 idsLength = ids.length; // Saves MLOADs.

        require(idsLength == amounts.length, "LENGTH_MISMATCH");

        for (uint256 i = 0; i < idsLength; ) {
            balanceOf[from][ids[i]] -= amounts[i];

            // An array can't have a total length
            // larger than the max uint256 value.
            unchecked {
                ++i;
            }
        }

        emit TransferBatch(msg.sender, from, address(0), ids, amounts);
    }

    /// @notice Internal function for burning a specific amount of a token type owned by a specific address.
    /// @dev Decreases the balance of the specified token ID by the provided amount.
    /// @param from Address of the token owner.
    /// @param id ID of the token to be burned.
    /// @param amount Amount of the token to be burned.
    function _burn(address from, uint256 id, uint256 amount) internal virtual {
        balanceOf[from][id] -= amount;

        emit TransferSingle(msg.sender, from, address(0), id, amount);
    }
}

/// @title ERC1155 Token Receiver Interface
/// @notice Interface for any contract that wants to support safeTransfers from ERC1155 asset contracts.
abstract contract ERC1155TokenReceiver {
    /// @notice Handle the receipt of an ERC1155 single type.
    /// @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external virtual returns (bytes4);

    /// @notice Handle the receipt of multiple ERC1155 token types.
    /// @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external virtual returns (bytes4);
}
