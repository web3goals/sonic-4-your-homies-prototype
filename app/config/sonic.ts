import { Address } from "viem";
import { sonic } from "viem/chains";

export const sonicConfig = {
  chain: sonic,
  contracts: {
    erc20Factory: "0x17DC361D05E1A608194F508fFC4102717666779f" as Address,
    stake: "0xFC00FACE00000000000000000000000000000000" as Address,
    scUSD: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE" as Address,
  },
  stakeValidatorId: 18,
  deBridgeChainId: "100000014",
  deBridgeNativeTokenAddress: "0x0000000000000000000000000000000000000000",
};
