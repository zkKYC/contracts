import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { ZkKYC__factory } from "../typechain-types";

const zeroAddr = "0x0000000000000000000000000000000000000000";

describe("zkKYC-SBT-1155", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ZkKYC = (await hre.ethers.getContractFactory(
      "zkKYC"
    )) as ZkKYC__factory;
    const zkKYC = await ZkKYC.deploy(20, otherAccount);

    return { zkKYC, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Right name and symbol", async function () {
      const { zkKYC } = await loadFixture(deployFixture);

      expect(await zkKYC.name()).to.equal("zkPass");
      expect(await zkKYC.symbol()).to.equal("ZKP");
    });

    it("Right owner", async function () {
      const { zkKYC, owner } = await loadFixture(deployFixture);
      expect(await zkKYC.owner()).to.equal(owner.address);
    });
  });

  describe("Mint cases", function () {
    it("Mint owner", async function () {
      const { zkKYC, owner } = await loadFixture(deployFixture);

      await zkKYC.setURI(0, "123");

      await expect(zkKYC.mint(owner, "0", "1")).to.emit(
        zkKYC,
        "TransferSingle"
      );
      await expect(zkKYC.mint(owner, "1", "200")).to.emit(
        zkKYC,
        "TransferSingle"
      );

      expect(await zkKYC.balanceOf(owner, 0)).to.be.equal(1);
      expect(await zkKYC.balanceOf(owner, 1)).to.be.equal(200);

      expect(await zkKYC.uri(0)).to.be.equal("123");
    });

    // it("batchMint owner", async function () {
    //   const { zkKYC, owner } = await loadFixture(deployFixture);

    //   await zkKYC.setURI(0, "123");

    //   await expect(
    //     zkKYC.connect(owner).batchMint(owner, [0, 1], [1, 200])
    //   ).to.emit(zkKYC, "TransferBatch");

    //   expect(await zkKYC.balanceOf(owner, 0)).to.be.equal(1);
    //   expect(await zkKYC.balanceOf(owner, 1)).to.be.equal(200);

    //   expect(await zkKYC.uri(0)).to.be.equal("123");
    // });

    // it("Mint otherAccount", async function () {
    //   const { zkKYC, otherAccount } = await loadFixture(deployFixture);

    //   await expect(
    //     zkKYC.connect(otherAccount).mint(otherAccount, "0", "1")
    //   ).to.be.revertedWith("UNAUTHORIZED");
    // });

    // it("batchMint otherAccount", async function () {
    //   const { zkKYC, otherAccount } = await loadFixture(deployFixture);

    //   await expect(
    //     zkKYC.connect(otherAccount).batchMint(otherAccount, [0, 1], [1, 100])
    //   ).to.be.revertedWith("UNAUTHORIZED");
    // });

    it("Mint owner to zero address", async function () {
      const { zkKYC, owner } = await loadFixture(deployFixture);

      await expect(zkKYC.mint(zeroAddr, "0", "1")).to.be.revertedWith(
        "UNSAFE_RECIPIENT"
      );
    });

    it("Mint owner amount == 0", async function () {
      const { zkKYC, owner } = await loadFixture(deployFixture);

      await zkKYC.setURI(0, "123");

      await expect(zkKYC.mint(owner, "0", "0")).to.be.revertedWith(
        "ZERO_AMOUNT"
      );
    });

    // it("batchMint owner amount == 0", async function () {
    //   const { zkKYC, owner } = await loadFixture(deployFixture);

    //   await zkKYC.setURI(0, "123");

    //   await expect(
    //     zkKYC.connect(owner).batchMint(owner, [0, 1], [1, 0])
    //   ).to.be.revertedWith("ZERO_AMOUNT");
    // });

    //   it("batchMint owner length mismatch", async function () {
    //     const { zkKYC, owner } = await loadFixture(deployFixture);

    //     await zkKYC.setURI(0, "123");

    //     await expect(
    //       zkKYC.connect(owner).batchMint(owner, [0, 1], [1, 200, 10])
    //     ).to.be.revertedWith("LENGTH_MISMATCH");
    //   });
  });

  describe("Burn cases", function () {
    it("Burn owner", async function () {
      const { zkKYC, owner, otherAccount } = await loadFixture(deployFixture);

      await expect(zkKYC.mint(otherAccount, "0", "1")).to.emit(
        zkKYC,
        "TransferSingle"
      );
      await expect(zkKYC.mint(otherAccount, "1", "200")).to.emit(
        zkKYC,
        "TransferSingle"
      );

      expect(await zkKYC.balanceOf(otherAccount, 0)).to.be.equal(1);
      expect(await zkKYC.balanceOf(otherAccount, 1)).to.be.equal(200);

      await expect(zkKYC.connect(owner).burn(otherAccount, 0, 1)).to.emit(
        zkKYC,
        "TransferSingle"
      );
      expect(await zkKYC.balanceOf(otherAccount, 0)).to.be.equal(0);
    });

    // it("batchBurn owner", async function () {
    //   const { zkKYC, owner, otherAccount } = await loadFixture(deployFixture);

    //   await expect(
    //     zkKYC.connect(owner).batchMint(otherAccount, [0, 1], [1, 200])
    //   ).to.emit(zkKYC, "TransferBatch");

    //   expect(await zkKYC.balanceOf(otherAccount, 0)).to.be.equal(1);
    //   expect(await zkKYC.balanceOf(otherAccount, 1)).to.be.equal(200);

    //   await expect(
    //     zkKYC.connect(owner).batchBurn(otherAccount, [0, 1], [1, 100])
    //   ).to.emit(zkKYC, "TransferBatch");

    //   expect(await zkKYC.balanceOf(otherAccount, 0)).to.be.equal(0);
    //   expect(await zkKYC.balanceOf(otherAccount, 1)).to.be.equal(100);
    // });

    // it("Burn otherAccount", async function () {
    //   const { zkKYC, otherAccount, owner } = await loadFixture(deployFixture);

    //   await expect(zkKYC.mint(otherAccount, "1", "200")).to.emit(
    //     zkKYC,
    //     "TransferSingle"
    //   );

    //   await expect(
    //     zkKYC.connect(otherAccount).burn(otherAccount, "0", "1")
    //   ).to.be.revertedWith("UNAUTHORIZED");
    // });

    // it("batchBurn otherAccount", async function () {
    //   const { zkKYC, owner, otherAccount } = await loadFixture(deployFixture);

    //   await expect(
    //     zkKYC.connect(owner).batchMint(otherAccount, [0, 1], [1, 100])
    //   ).to.emit(zkKYC, "TransferBatch");

    //   await expect(
    //     zkKYC.connect(otherAccount).batchBurn(otherAccount, [0, 1], [1, 100])
    //   ).to.be.revertedWith("UNAUTHORIZED");
    // });

    it("Burn zero balance", async function () {
      const { zkKYC, otherAccount, owner } = await loadFixture(deployFixture);

      await expect(
        zkKYC.connect(owner).burn(otherAccount, "0", "1")
      ).to.be.revertedWithPanic();
    });
  });
});
