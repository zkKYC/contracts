// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MerkleTreeWithHistory, IHasher} from "./MerkleTreeWithHistory.sol";
import {SiberiumNameService} from "./SiberiumNameService.sol";
import {Soulbound} from "./sbt/SBT.sol";

contract zkKYC is Soulbound, MerkleTreeWithHistory, SiberiumNameService {
    uint256 public registrationFeePerYear = 0.1 ether;
    uint256 public removeNameFee = 0.05 ether;

    mapping(address => bytes32) private userPass;
    mapping(address => uint256) private userNonces;
    mapping(bytes32 => bool) public commitments;

    uint256 public globalNonce;

    event CreateCommitment(bytes32 indexed commitment, uint32 leafIndex);

    constructor(
        uint32 _levels,
        IHasher _hasher
    ) Soulbound("zkPass", "ZKP") MerkleTreeWithHistory(_levels, _hasher) {}

    function setPass(address user, bytes32 _hashKYC) public onlyOwner {
        userPass[user] = _hashKYC;
        // mint SBT-1155
        mint(user, 0, 1);
    }

    function createCommitment(bytes32 _commitment) external {
        require(!commitments[_commitment], "The commitment has been submitted");
        // require(userPass[msg.sender] != bytes32(0x00), "NONREGISTRY");
        uint32 insertedIndex = _insert(_commitment);
        commitments[_commitment] = true;

        emit CreateCommitment(_commitment, insertedIndex);
    }

    function getHashKYC(address user) public view returns (bytes32) {
        return userPass[user];
    }

    function registerName(
        string calldata _name,
        uint256 _period
    ) external payable {
        require(
            msg.value >= registrationFeePerYear * _period,
            "Insufficient payment"
        );
        require(
            balanceOf[msg.sender][1] == 0,
            "Your address already has a domain"
        );
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        _registerName(nameHash, msg.sender, _period);
        _mint(msg.sender, 1, uint(nameHash), "");
        names[msg.sender] = _name;
    }

    function renewName(
        string calldata _name,
        uint256 _period
    ) external payable {
        require(
            msg.value >= registrationFeePerYear * _period,
            "Insufficient payment"
        );
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        _renewName(nameHash, msg.sender, _period);
    }

    function removeName(string calldata _name) external {
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        address nameOwner = records[nameHash].addr;
        _removeName(nameHash);
        _burn(nameOwner, 1, uint(nameHash));
        payable(msg.sender).transfer(0.01 ether);
    }

    function buyName(uint256 _offerID) external payable {
        require(
            balanceOf[msg.sender][1] == 0,
            "Your address already has a domain"
        );
        Offer memory offer = offers[_offerID];
        require(offer.price <= msg.value);
        payable(offer.owner).transfer(msg.value);

        _burn(offer.owner, 1, balanceOf[offer.owner][1]);

        bytes32 nameHash = keccak256(abi.encodePacked(names[offer.owner]));
        _mint(msg.sender, 1, uint(nameHash), "");
        records[nameHash].addr = msg.sender;
        emit BuyOffer(nameHash);
    }

    function sellName(uint256 _price) external {
        offers[offersIDs] = Offer({price: _price, owner: msg.sender});
        bytes32 nameHash = keccak256(abi.encodePacked(names[msg.sender]));
        emit SellOffer(nameHash, _price, names[msg.sender]);
    }

    function setRegistrationFeePerYear(uint256 newFee) public onlyOwner {
        registrationFeePerYear = newFee;
    }

    function setRemoveNameFee(uint256 newFee) public onlyOwner {
        removeNameFee = newFee;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
