import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { groth16, zKey } from "snarkjs";

import { MiMCSponge } from "../helpers/MiMCSponge";

import input1 from "../circuits/age/input1.json";

const wasmPath = "./circuits/age/age_js/age.wasm";
const zkeyPath = "./circuits/age/age_0001.zkey";

describe("age proof", function () {
  async function deploy() {
    const mimcSponge = new MiMCSponge();
    await mimcSponge.init();

    const AgeVerifier = await hre.ethers.getContractFactory("AgeVerifier");
    const ageVerifier = await AgeVerifier.deploy();

    return { ageVerifier, mimcSponge };
  }

  it("check proof", async () => {
    const { ageVerifier, mimcSponge } = await loadFixture(deploy);

    mimcSponge.multiHash([1263330000, 1]);
    mimcSponge.multiHash([979333200, 1]);

    const { proof, publicSignals } = await groth16.fullProve(
      input1,
      wasmPath,
      zkeyPath
    );

    const vkey = await zKey.exportVerificationKey(zkeyPath);
    const localCheckProof = await groth16.verify(vkey, publicSignals, proof);

    const contractCheckProof = await ageVerifier.verifyProof(
      [proof.pi_a[0], proof.pi_a[1]],
      [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
      ],
      [proof.pi_c[0], proof.pi_c[1]],
      [
        // publicSignals
        BigInt(publicSignals[0]),
        BigInt(publicSignals[1]),
        BigInt(publicSignals[2]),
        BigInt(publicSignals[3]),
      ]
    );

    // Verification checks
    expect(localCheckProof).to.be.true;
    expect(contractCheckProof).to.be.true;
  });
});
