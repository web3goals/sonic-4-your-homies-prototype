import { Address } from "viem";

export const CONTRACTS: {
  [key: string]: {
    erc20Factory: Address | undefined;
  };
} = {
  sonic: {
    erc20Factory: "0x17DC361D05E1A608194F508fFC4102717666779f",
  },
  sonicTestnet: {
    erc20Factory: "0x02008a8dbc938bd7930bf370617065b6b0c1221a",
  },
};
