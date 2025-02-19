import { Address } from "viem";
import { Chain } from "viem/chains";

export const sonicTestnet: Chain = {
  id: 57054,
  name: "Sonic Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Sonic",
    symbol: "S",
  },
  rpcUrls: {
    default: { http: ["https://rpc.blaze.soniclabs.com"] },
  },
  blockExplorers: {
    default: {
      name: "Sonic Testnet Explorer",
      url: "https://testnet.sonicscan.org",
    },
  },
  testnet: true,
};

export const chainsConfig = [
  {
    chain: sonicTestnet,
    contracts: {
      erc20Factory: "0x02008a8dbc938bd7930bf370617065b6b0c1221a" as Address,
    },
  },
];
