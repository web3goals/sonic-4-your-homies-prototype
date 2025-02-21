import "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true,
    },
  },
  networks: {
    sonic: {
      url: "https://rpc.soniclabs.com",
      accounts: [process.env.PRIVATE_KEY as string],
    },
    sonicTestnet: {
      url: "https://rpc.blaze.soniclabs.com",
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
