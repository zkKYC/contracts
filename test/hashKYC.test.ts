import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MerkleTree, HashFunction, Element } from "fixed-merkle-tree";
import { expect } from "chai";
import hre from "hardhat";

import { MiMC } from "../helpers/MiMC";
import { MiMCSponge } from "../helpers/MiMCSponge";

import { toFixedHex } from "../helpers/common";

const ZERO_VALUE =
  "21663839004416932945382355908790599225266501822907911457504978515578255421292";

describe("hashKYC", function () {
  async function createTree() {
    const mimcSponge = new MiMCSponge();
    await mimcSponge.init();

    const mimc = new MiMC();
    await mimc.init();

    const hashFunction: HashFunction<Element> = (left, right) => {
      return mimc.hash(left, right);
    };

    const tree = new MerkleTree(3, undefined, {
      hashFunction,
      zeroElement: ZERO_VALUE,
    });

    const country = "036"; // ISO
    const birthday = 979333200;
    const pass = "1234567890";
    const snils = "33333333322";
    const name = hre.ethers.encodeBytes32String("name");
    const lastname = hre.ethers.encodeBytes32String("lastname");
    const patronymic = hre.ethers.encodeBytes32String("patronymic");
    const sex = 0;

    const countryHash = mimcSponge.multiHash([country]);
    const birthdayHash = mimcSponge.multiHash([birthday]);
    const passHash = mimcSponge.multiHash([pass]);
    const snilsHash = mimcSponge.multiHash([snils]);
    const nameHash = mimcSponge.multiHash([name]);
    const lastnameHash = mimcSponge.multiHash([lastname]);
    const patronymicHash = mimcSponge.multiHash([patronymic]);
    const sexHash = mimcSponge.multiHash([sex]);

    console.log(countryHash);

    tree.insert(countryHash);
    tree.insert(birthdayHash);
    tree.insert(passHash);
    tree.insert(snilsHash);
    tree.insert(nameHash);
    tree.insert(lastnameHash);
    tree.insert(patronymicHash);
    tree.insert(sexHash);

    return { mimcSponge, tree };
  }

  describe("Local tree", function () {
    it("KYC tree", async () => {
      const { tree, mimcSponge } = await loadFixture(createTree);

      const proof = tree.path(0);

      console.log(proof);
    });
  });

  describe("age proof", function () {
    it("KYC tree", async () => {
      const { tree, mimcSponge } = await loadFixture(createTree);

      const now = Math.floor(Date.now() / 1000);
      console.log("now", now);

      const proof = tree.path(1);

      console.log(proof);
    });
  });
});
