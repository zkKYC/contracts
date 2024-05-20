import hre from "hardhat";
import { ZkKYC__factory } from "../typechain-types";

// npx hardhat run scripts/deploy.s.ts --network localhost
async function main() {
  const ZkKYC = (await hre.ethers.getContractFactory(
    "zkKYC"
  )) as ZkKYC__factory;
  const zkKYC = await ZkKYC.deploy();

  console.log(`zkKYC deployed to ${zkKYC.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
