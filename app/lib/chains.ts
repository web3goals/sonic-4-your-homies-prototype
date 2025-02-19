import { sonicTestnet } from "@/config/chains";
import { Chain, extractChain } from "viem";
import * as chains from "viem/chains";

export function getChainById(id: number): Chain {
  return extractChain({
    chains: [...Object.values(chains), sonicTestnet],
    id: id as (typeof chains)[keyof typeof chains]["id"],
  });
}
