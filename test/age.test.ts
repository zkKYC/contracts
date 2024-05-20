import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { groth16, zKey } from "snarkjs";

import { MiMCSponge } from "../helpers/MiMCSponge";
import { abi, bytecode } from "../helpers/Hasher.json";

import input from "../circuits/age/input.json";
import input1 from "../circuits/age/input1.json";

const levels = 20;
const wasmPath = "./circuits/age/age_js/age.wasm";
const zkeyPath = "./circuits/age/age_0001.zkey";

describe("age proof", function () {
  async function deploy() {
    const mimcSponge = new MiMCSponge();
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

    return { hasher, merkleTreeWithHistory, mimcSponge };
  }

  it("check proof", async () => {
    const { mimcSponge } = await loadFixture(deploy);

    mimcSponge.multiHash([1263330000, 1]);
    mimcSponge.multiHash([979333200, 1]);

    const { proof, publicSignals } = await groth16.fullProve(
      input1,
      wasmPath,
      zkeyPath
    );

    const vkey = await zKey.exportVerificationKey(zkeyPath);
    const checkProof = await groth16.verify(vkey, publicSignals, proof);
    expect(checkProof).to.be.true;
  });
});
