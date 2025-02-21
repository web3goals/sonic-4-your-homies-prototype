import { sonicConfig } from "@/config/sonic";
import {
  ActionProvider,
  CreateAction,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import axios from "axios";
import { parseEther } from "viem";
import { z } from "zod";
import { SwapSForScUSDSchema } from "./schemas";

/**
 * An action provider with tools for swap.
 */
export class SwapActionProvider extends ActionProvider {
  constructor() {
    super("swap", []);
  }

  /**
   * Swaps S tokens for scUSD tokens.
   */
  @CreateAction({
    name: "swap_s_for_scusd",
    description: [
      "This tool will swap native tokens for scUSD tokens.",
      "It takes the following inputs:",
      "- amount: The amount of native tokens to swap for scUSD tokens",
      "Important notes:",
      "- Ensure sufficient balance of tokens before swaping",
    ].join("\n"),
    schema: SwapSForScUSDSchema,
  })
  async swapSForScUSD(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof SwapSForScUSDSchema>
  ): Promise<string> {
    try {
      // Get data for swap transaction
      const { data } = await axios.get(
        "https://deswap.debridge.finance/v1.0/chain/transaction",
        {
          params: {
            chainId: sonicConfig.deBridgeChainId,
            tokenIn: sonicConfig.deBridgeNativeTokenAddress,
            tokenInAmount: parseEther(args.amount.toString()),
            tokenOut: sonicConfig.contracts.scUSD,
            tokenOutRecipient: walletProvider.getAddress(),
            tab: new Date().getTime(),
          },
        }
      );
      const swapTxData = {
        data: data.tx.data,
        to: data.tx.to,
        value: BigInt(data.tx.value),
      };

      // Send transaction
      const swapTxHash = await walletProvider.sendTransaction({
        data: swapTxData.data,
        to: swapTxData.to,
        value: swapTxData.value,
      });

      await walletProvider.waitForTransactionReceipt(swapTxHash);

      return `Swaped ${args.amount} native tokens for scUSD tokens`;
    } catch (error) {
      return `Error swap: ${error}`;
    }
  }

  /**
   * Checks if the action provider supports the given network.
   */
  supportsNetwork = () => {
    return true;
  };
}

/**
 * Factory function to create a new action provider instance.
 */
export const swapActionProvider = () => new SwapActionProvider();
