import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MerkleTree, HashFunction, Element } from "fixed-merkle-tree";
import { expect } from "chai";
import hre from "hardhat";
import { groth16, zKey } from "snarkjs";

import { MiMC } from "../helpers/MiMC";
import { MiMCSponge } from "../helpers/MiMCSponge";
import { abi, bytecode } from "../helpers/Hasher.json";
import { toFixedHex } from "../helpers/common";
import { ZkKYC__factory } from "../typechain-types";

const levels = 20;
const ZERO_VALUE =
  "21663839004416932945382355908790599225266501822907911457504978515578255421292";
const SECRET = 12321n;
const ADDR = 0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199n;

const wasmPath = "./circuits/commitment/commitment_js/commitment.wasm";
const zkeyPath = "./circuits/commitment/commitment_0001.zkey";

const mimcSponge = new MiMCSponge();
describe("Commitment", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const mimc = new MiMC();

    await mimc.init();
    await mimcSponge.init();

    const Hahser = await hre.ethers.getContractFactory(abi, bytecode);
    const hasher = await Hahser.deploy();

    const hashFunction: HashFunction<Element> = (left, right) => {
      return mimc.hash(left, right);
    };

    const ZkKYC = (await hre.ethers.getContractFactory(
      "zkKYC"
    )) as ZkKYC__factory;
    const zkKYC = await ZkKYC.deploy(20, hasher);

    return { zkKYC, owner, otherAccount, hasher, mimc, hashFunction };
  }

  function generateCommitment() {
    const secret = toFixedHex(SECRET);
    const addr = toFixedHex(ADDR);
    console.log("secret:", secret);
    console.log("addr:", addr);
    const commitment = mimcSponge.multiHash([addr, secret]);
    return toFixedHex(BigInt(commitment));
  }

  it("create commitment", async () => {
    const { zkKYC } = await loadFixture(deployFixture);
    const commitment = generateCommitment();
    await expect(zkKYC.createCommitment(commitment)).to.emit(
      zkKYC,
      "CreateCommitment"
    );
  });

  it("should throw if there is a such commitmentt", async () => {
    const { zkKYC } = await loadFixture(deployFixture);
    const commitment = generateCommitment();
    await expect(zkKYC.createCommitment(commitment)).to.emit(
      zkKYC,
      "CreateCommitment"
    );
    await expect(zkKYC.createCommitment(commitment)).to.be.revertedWith(
      "The commitment has been submitted"
    );
  });

  it("t", async () => {
    const { zkKYC, hashFunction } = await loadFixture(deployFixture);
    const commitment = generateCommitment();

    const tree = new MerkleTree(levels, [], {
      hashFunction,
      zeroElement: ZERO_VALUE,
    });

    tree.insert(commitment);
    const ind = tree.indexOf(commitment);

    const treeProof = tree.path(ind);

    const input = {
      root: treeProof.pathRoot,
      secret: toFixedHex(SECRET),
      addr: toFixedHex(ADDR),
      pathIndices: treeProof.pathIndices,
      pathElements: treeProof.pathElements,
    };

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    const vkey = await zKey.exportVerificationKey(zkeyPath);
    const localCheckProof = await groth16.verify(vkey, publicSignals, proof);
    expect(localCheckProof).to.be.true;

    console.log(localCheckProof);
  });
});
