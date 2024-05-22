// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract SiberiumNameService {
    uint256 constant registrationPeriod = 365 days;

    struct Record {
        address addr;
        uint256 expires;
    }

    mapping(bytes32 => Record) public records;
    mapping(address => string) public names;

    event NameRegistered(
        bytes32 indexed nameHash,
        address indexed owner,
        uint256 expires
    );
    event NameRenewed(bytes32 indexed nameHash, uint256 newExpiry);

    modifier isActive(bytes32 nameHash) {
        require(
            records[nameHash].expires >= block.timestamp,
            "Name is not registered or has expired"
        );
        _;
    }

    function _registerName(
        bytes32 _nameHash,
        address addr,
        uint256 _period
    ) internal {
        require(_period > 0, "Number of years must be greater than 0");
        require(
            records[_nameHash].expires < block.timestamp,
            "Name is already registered and active"
        );
        records[_nameHash] = Record(
            addr,
            block.timestamp + registrationPeriod * _period
        );
        emit NameRegistered(_nameHash, addr, records[_nameHash].expires);
    }

    function _renewName(
        bytes32 _nameHash,
        address addr,
        uint256 _period
    ) internal isActive(_nameHash) {
        require(_period > 0, "Number of years must be greater than 0");
        require(_getAddress(_nameHash) == addr);
        records[_nameHash].expires += registrationPeriod * _period;
        emit NameRenewed(_nameHash, records[_nameHash].expires);
    }

    function getAddress(string memory name) public view returns (address) {
        bytes32 nameHash = keccak256(abi.encodePacked(name));
        return _getAddress(nameHash);
    }

    function _getAddress(bytes32 nameHash) internal view returns (address) {
        Record memory record = records[nameHash];
        if (record.expires >= block.timestamp) {
            return record.addr;
        } else {
            return address(0);
        }
    }

    function _removeName(bytes32 nameHash) internal {
        require(records[nameHash].expires < block.timestamp, "Name is active");
        delete records[nameHash];
    }
}
