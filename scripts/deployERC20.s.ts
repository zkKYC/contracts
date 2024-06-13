import hre from "hardhat";

// npx hardhat run scripts/deployERC20.s.ts --network amoy
async function main() {
  const ERC20 = await hre.ethers.getContractFactory("MyToken");
  const erc20 = await ERC20.deploy();

  console.log(`erc20 deployed to ${erc20.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
