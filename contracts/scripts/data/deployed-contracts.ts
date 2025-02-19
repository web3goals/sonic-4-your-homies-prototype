import { Address } from "viem";

export const CONTRACTS: {
  [key: string]: {
    erc20Factory: Address | undefined;
  };
} = {
  sonicTestnet: {
    erc20Factory: "0x02008a8dbc938bd7930bf370617065b6b0c1221a",
  },
};
