import hre from "hardhat";
import { ZkKYC__factory } from "../typechain-types";

import { MiMC } from "../helpers/MiMC";
import { abi, bytecode } from "../helpers/Hasher.json";

// npx hardhat run scripts/deploy.s.ts --network localhost
async function main() {
  const mimcSponge = new MiMC();
  await mimcSponge.init();

  const Hahser = await hre.ethers.getContractFactory(abi, bytecode);
  const hasher = await Hahser.deploy();

  console.log(`hasher deployed to ${hasher.target}`);

  const ZkKYC = (await hre.ethers.getContractFactory(
    "zkKYC"
  )) as ZkKYC__factory;
  const zkKYC = await ZkKYC.deploy(20, hasher.target);

  console.log(`zkKYC deployed to ${zkKYC.target}`);

  await zkKYC.setPass(
    "0x629d5B9255A140d4c373B29f751669563ED54916",
    "0xd0b3d0bed0b2d0bdd0be00000000000000000000000000000000000000000000"
  );
  await zkKYC.setPass(
    "0x3128ef7F0933cF2bA18f1Ef7280A7b684347B115",
    "0xd0b3d0bed0b2d0bdd0be00000000000000000000000000000000000000000000"
  );
  await zkKYC.setPass(
    "0x4eb6EBcfA62792A01E5005c453F39D63493a79B8",
    "0xd0b3d0bed0b2d0bdd0be00000000000000000000000000000000000000000000"
  );

  await zkKYC.setURI(
    0,
    "https://ipfs.io/ipfs/QmaNMk641puZy1uth85UCM4MZiXB9qUyuverkBo5bPu35n"
  );

  await zkKYC.registerName("name.sib", 1);

  await zkKYC.sellName(100000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
