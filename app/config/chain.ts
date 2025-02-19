import { Chain } from "viem/chains";

const sonicTestnet: Chain = {
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

export const chainConfig = {
  chain: sonicTestnet,
  contracts: {},
};
