import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MerkleTree, HashFunction, Element } from "fixed-merkle-tree";
import { expect } from "chai";
import hre from "hardhat";

import { MiMC } from "../helpers/MiMC";
import { abi, bytecode } from "../helpers/Hasher.json";
import { toFixedHex } from "../helpers/common";

const levels = 20;
const ZERO_VALUE =
  "21663839004416932945382355908790599225266501822907911457504978515578255421292";

describe("MerkleTree", function () {
  async function deployContracts() {
    const mimcSponge = new MiMC();
    await mimcSponge.init();

    const Hahser = await hre.ethers.getContractFactory(abi, bytecode);
    const hasher = await Hahser.deploy();

    const MerkleTreeWithHistory = await hre.ethers.getContractFactory(
      "MerkleTreeWithHistoryMock"
    );
    const merkleTreeWithHistory = await MerkleTreeWithHistory.deploy(
      levels,
      hasher.target
    );

    const hashFunction: HashFunction<Element> = (left, right) => {
      return mimcSponge.hash(left, right);
    };

    return { hasher, merkleTreeWithHistory, mimcSponge, hashFunction };
  }

  describe("MerkleTreeWithHistory", function () {
    it("should initialize", async () => {
      const { merkleTreeWithHistory } = await loadFixture(deployContracts);

      const zeroValue = await merkleTreeWithHistory.ZERO_VALUE();
      const firstSubtree = await merkleTreeWithHistory.filledSubtrees(0);
      expect(firstSubtree).to.be.equal(toFixedHex(zeroValue));
      const firstZero = await merkleTreeWithHistory.zeros(0);
      expect(firstZero).to.be.equal(toFixedHex(zeroValue));
    });

    it("tests insert", async () => {
      const { mimcSponge, hashFunction } = await loadFixture(deployContracts);

      const tree = new MerkleTree(2, undefined, {
        hashFunction,
        zeroElement: "0",
      });

      tree.insert(toFixedHex(BigInt(5)));
      const proof = tree.path(0);

      const calculated_root = mimcSponge.hash(
        mimcSponge.hash("5", proof.pathElements[0]),
        proof.pathElements[1]
      );

      expect(calculated_root).to.be.equal(proof.pathRoot);
    });

    it("equal to hashes", async () => {
      const { hasher, mimcSponge, merkleTreeWithHistory } = await loadFixture(
        deployContracts
      );

      const local = mimcSponge.hash(
        toFixedHex(BigInt(1)),
        toFixedHex(BigInt(2))
      );

      const contract = await merkleTreeWithHistory.hashLeftRight(
        hasher.target,
        toFixedHex(BigInt(1)),
        toFixedHex(BigInt(2))
      );

      expect(BigInt(local)).to.be.equal(BigInt(contract));
    });

    it("should insert", async () => {
      const { merkleTreeWithHistory, hashFunction } = await loadFixture(
        deployContracts
      );

      const tree = new MerkleTree(levels, [], {
        hashFunction,
        zeroElement: ZERO_VALUE,
      });

      let rootFromContract;

      for (let i = 1; i < 11; i++) {
        await merkleTreeWithHistory.insert(toFixedHex(BigInt(i)));
        tree.insert(i);
        const path = tree.path(i - 1);
        rootFromContract = await merkleTreeWithHistory.getLastRoot();
        expect(toFixedHex(BigInt(path.pathRoot))).to.be.equal(
          rootFromContract.toString()
        );
      }
    });
    it("should find an element", async () => {
      const { hashFunction } = await loadFixture(deployContracts);

      const tree = new MerkleTree(levels, [], {
        hashFunction,
        zeroElement: ZERO_VALUE,
      });

      const elements = [12, 13, 14, 15, 16, 17, 18, 19, 20];
      for (const [, el] of Object.entries(elements)) {
        tree.insert(el);
      }
      let index = tree.indexOf(13);
      expect(index).to.be.equal(1);

      index = tree.indexOf(19);
      expect(index).to.be.equal(7);

      index = tree.indexOf(12);
      expect(index).to.be.equal(0);

      index = tree.indexOf(20);
      expect(index).to.be.equal(8);

      index = tree.indexOf(42);
      expect(index).to.be.equal(-1);
    });
  });

  it.skip("creation using 30000 elements", async () => {
    const { hashFunction } = await loadFixture(deployContracts);

    const elements = [];
    for (let i = 1000; i < 31001; i++) {
      elements.push(i);
    }

    console.time("MerkleTree");

    const tree = new MerkleTree(levels, elements, {
      hashFunction,
      zeroElement: ZERO_VALUE,
    });

    console.timeEnd("MerkleTree");
  });

  describe("isKnownRoot()", () => {
    it("should work", async () => {
      const { hashFunction, merkleTreeWithHistory } = await loadFixture(
        deployContracts
      );

      const tree = new MerkleTree(levels, [], {
        hashFunction,
        zeroElement: ZERO_VALUE,
      });

      let path;

      for (let i = 1; i < 5; i++) {
        await merkleTreeWithHistory.insert(toFixedHex(BigInt(i)));
        tree.insert(i);
        path = tree.path(i - 1);
        let isKnown = await merkleTreeWithHistory.isKnownRoot(
          toFixedHex(BigInt(path.pathRoot))
        );

        expect(isKnown).to.be.true;
      }
    });
  });
});
