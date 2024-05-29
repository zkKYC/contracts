import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
require("hardhat-abi-exporter");

const privateKey =
  process.env.PRIVATE_KEY !== undefined
    ? process.env.PRIVATE_KEY
    : "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const amoy =
  process.env.POLYGON_AMOY_RPC_PROVIDER !== undefined
    ? process.env.POLYGON_AMOY_RPC_PROVIDER
    : "http://127.0.0.1:8545";

const polygonScanKey =
  process.env.POLYGONSCAN_API_KEY !== undefined
    ? process.env.POLYGONSCAN_API_KEY
    : "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    amoy: {
      url: amoy,
      accounts: [`0x${privateKey}`],
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: polygonScanKey,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};

export default config;
