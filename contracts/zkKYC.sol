// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Soulbound} from "./sbt/SBT.sol";

contract zkKYC is Soulbound {
    struct Passport {
        bytes32 fullNameHash;
        bytes32 numberHash;
        bytes32 genderHash;
        bytes32 birthDateHash;
        bytes32 birthPlaceHash;
        bytes32 otherAttributesHash;
    }

    struct UserDocuments {
        bytes32 ssnHash;
        Passport passport;
        bytes32 ageHash;
        bytes32 countryHash;
        bytes32 regionHash;
    }

    mapping(address => UserDocuments) private userDocuments;
    mapping(address => uint256) private userNonces;

    uint256 public globalNonce;

    constructor() Soulbound("zkPass", "ZKP") {}

    function setDocuments(
        address user,
        bytes32 _ssnHash,
        bytes32 _fullNameHash,
        bytes32 _numberHash,
        bytes32 _genderHash,
        bytes32 _birthDateHash,
        bytes32 _birthPlaceHash,
        bytes32 _otherAttributesHash,
        bytes32 _ageHash,
        bytes32 _countryHash,
        bytes32 _regionHash
    ) public onlyOwner {
        Passport memory passport = Passport({
            fullNameHash: _fullNameHash,
            numberHash: _numberHash,
            genderHash: _genderHash,
            birthDateHash: _birthDateHash,
            birthPlaceHash: _birthPlaceHash,
            otherAttributesHash: _otherAttributesHash
        });

        userDocuments[user] = UserDocuments({
            ssnHash: _ssnHash,
            passport: passport,
            ageHash: _ageHash,
            countryHash: _countryHash,
            regionHash: _regionHash
        });
    }

    function getDocuments(
        address user
    ) public view returns (UserDocuments memory) {
        return userDocuments[user];
    }
}
