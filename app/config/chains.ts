import { Address } from "viem";
import { Chain, sonic } from "viem/chains";

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
    chain: sonic,
    contracts: {
      erc20Factory: "0x0000000000000000000000000000000000000000" as Address,
      stake: "0xFC00FACE00000000000000000000000000000000" as Address,
      scUSD: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE" as Address,
    },
    stakeValidatorId: 18,
  },
  {
    chain: sonicTestnet,
    contracts: {
      erc20Factory: "0x02008a8dbc938bd7930bf370617065b6b0c1221a" as Address,
      stake: "0x0000000000000000000000000000000000000000" as Address,
      scUSD: "0x0000000000000000000000000000000000000000" as Address,
    },
    stakeValidatorId: 0,
  },
];
