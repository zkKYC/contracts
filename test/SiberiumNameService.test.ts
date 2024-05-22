import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { ZkKYC__factory } from "../typechain-types";

const name = "whitecoon.sib";

const oneYear = 31536000;

describe("zkKYC-SiberiumNameService", function () {
  async function deployFixture() {
    const [owner, client] = await hre.ethers.getSigners();

    const ZkKYC = (await hre.ethers.getContractFactory(
      "zkKYC"
    )) as ZkKYC__factory;
    const zkKYC = await ZkKYC.deploy(20, client);

    return { zkKYC, owner, client };
  }

  it("register name", async function () {
    const { zkKYC, owner } = await loadFixture(deployFixture);

    await expect(
      zkKYC.registerName(name, "2", { value: hre.ethers.parseEther("0.2") })
    ).to.emit(zkKYC, "TransferSingle");

    expect(await zkKYC.balanceOf(owner, 1)).to.be.equal(
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name))
    );
  });

  it("Your address already has a domain", async function () {
    const { zkKYC, owner } = await loadFixture(deployFixture);

    await expect(
      zkKYC.registerName(name, "2", { value: hre.ethers.parseEther("0.2") })
    ).to.emit(zkKYC, "TransferSingle");

    await expect(
      zkKYC.registerName(name, "2", { value: hre.ethers.parseEther("0.2") })
    ).to.be.revertedWith("Your address already has a domain");

    expect(await zkKYC.balanceOf(owner, 1)).to.be.equal(
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name))
    );
  });

  it("already registered and active", async function () {
    const { zkKYC, owner, client } = await loadFixture(deployFixture);

    await expect(
      zkKYC.registerName(name, "2", { value: hre.ethers.parseEther("0.2") })
    ).to.emit(zkKYC, "TransferSingle");

    await expect(
      zkKYC
        .connect(client)
        .registerName(name, "2", { value: hre.ethers.parseEther("0.2") })
    ).to.be.revertedWith("Name is already registered and active");

    expect(await zkKYC.balanceOf(owner, 1)).to.be.equal(
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name))
    );
  });

  it("register - expire - remove - register", async function () {
    const { zkKYC, owner } = await loadFixture(deployFixture);

    const now = await time.latest();
    await expect(
      zkKYC.registerName(name, "1", { value: hre.ethers.parseEther("0.1") })
    ).to.emit(zkKYC, "TransferSingle");

    const balance = await zkKYC.balanceOf(owner, 1);

    expect(balance).to.be.equal(
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name))
    );

    await time.increaseTo(now + oneYear + 1000);

    await expect(
      zkKYC.registerName(name, "1", { value: hre.ethers.parseEther("0.1") })
    ).to.be.revertedWith("Your address already has a domain");

    await expect(zkKYC.removeName(name)).to.emit(zkKYC, "TransferSingle");

    expect(await zkKYC.balanceOf(owner, 1)).to.be.eqls(0n);

    await expect(
      zkKYC.registerName(name, "1", { value: hre.ethers.parseEther("0.1") })
    ).to.emit(zkKYC, "TransferSingle");
  });

  it("renew name", async function () {
    const { zkKYC, owner } = await loadFixture(deployFixture);

    await expect(
      zkKYC.registerName(name, "2", { value: hre.ethers.parseEther("0.2") })
    ).to.emit(zkKYC, "TransferSingle");

    const now = await time.latest();
    await time.increaseTo(now + 1000);

    await expect(
      zkKYC.renewName(name, "2", { value: hre.ethers.parseEther("0.2") })
    ).to.emit(zkKYC, "NameRenewed");

    expect(await zkKYC.balanceOf(owner, 1)).to.be.equal(
      hre.ethers.keccak256(hre.ethers.toUtf8Bytes(name))
    );
  });
});
