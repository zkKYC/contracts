// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

/// @notice Simple single owner authorization mixin.
/// @author Solmate (https://github.com/transmissions11/solmate/blob/main/src/auth/Owned.sol)
abstract contract Owned {
    /// @notice Emitted when ownership is transferred.
    /// @param user The address of the previous owner.
    /// @param newOwner The address of the new owner.
    event OwnershipTransferred(address indexed user, address indexed newOwner);

    /// @notice The address of the current owner.
    address public owner;

    /// @notice Ensures a function is called by the current owner.
    modifier onlyOwner() virtual {
        require(msg.sender == owner, "UNAUTHORIZED");
        _;
    }

    /// @dev Sets the initial owner of the contract to the deployer.
    /// @param _owner The address of the initial owner.
    constructor(address _owner) {
        owner = _owner;
        emit OwnershipTransferred(address(0), _owner);
    }

    /// @notice Transfers ownership of the contract to a new address, or relinquishes ownership if the zero address is passed.
    /// @dev Can only be called by the current owner.
    /// @param newOwner The address to transfer ownership to, or the zero address to relinquish ownership.
    function transferOwnership(address newOwner) external virtual onlyOwner {
        owner = newOwner;
        emit OwnershipTransferred(msg.sender, newOwner);
    }
}
