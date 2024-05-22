// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MerkleTreeWithHistory, IHasher} from "./MerkleTreeWithHistory.sol";
import {Soulbound} from "./sbt/SBT.sol";

contract zkKYC is Soulbound, MerkleTreeWithHistory {
    struct Passport {
        uint256 fullNameHash; // no proof
        uint256 numberHash;
        uint256 genderHash;
        uint256 birthTimestampHash;
        uint256 birthPlaceHash;
    }

    struct UserDocuments {
        uint256 ssnHash;
        Passport passport;
        uint256 ageHash;
        uint256 countryHash;
        uint256 regionHash;
        bool isExist;
    }

    mapping(address => UserDocuments) private userDocuments;
    mapping(address => uint256) private userNonces;
    mapping(bytes32 => bool) public commitments;

    uint256 public globalNonce;

    event CreateCommitment(bytes32 indexed commitment, uint32 leafIndex);

    constructor(
        uint32 _levels,
        IHasher _hasher
    ) Soulbound("zkPass", "ZKP") MerkleTreeWithHistory(_levels, _hasher) {}

    function setDocuments(
        address user,
        uint256 _fullNameHash,
        uint256 _numberHash,
        uint256 _genderHash,
        uint256 _birthTimestampHash,
        uint256 _birthPlaceHash,
        uint256 _ssnHash,
        uint256 _ageHash,
        uint256 _countryHash,
        uint256 _regionHash
    ) public onlyOwner {
        Passport memory passport = Passport({
            fullNameHash: _fullNameHash,
            numberHash: _numberHash,
            genderHash: _genderHash,
            birthTimestampHash: _birthTimestampHash,
            birthPlaceHash: _birthPlaceHash
        });

        userDocuments[user] = UserDocuments({
            ssnHash: _ssnHash,
            passport: passport,
            ageHash: _ageHash,
            countryHash: _countryHash,
            regionHash: _regionHash,
            isExist: true
        });

        // mint SBT-1155
        mint(user, 0, 1);
    }

    function createCommitment(bytes32 _commitment) external {
        require(!commitments[_commitment], "The commitment has been submitted");
        //  require(isExist(msg.sender), "NONREGISTRY");
        uint32 insertedIndex = _insert(_commitment);
        commitments[_commitment] = true;

        emit CreateCommitment(_commitment, insertedIndex);
    }

    function getDocuments(
        address user
    ) public view returns (UserDocuments memory) {
        return userDocuments[user];
    }

    function isExist(address user) public view returns (bool) {
        return userDocuments[user].isExist;
    }
}
