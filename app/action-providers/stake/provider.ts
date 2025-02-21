import { sonicConfig } from "@/config/sonic";
import {
  ActionProvider,
  CreateAction,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  formatEther,
  http,
  parseEther,
} from "viem";
import { sonic } from "viem/chains";
import { z } from "zod";
import { stakeAbi } from "./abi/stake";
import { GetStakeBalanceSchema, StakeSchema } from "./schemas";

/**
 * An action provider with tools for stake.
 */
export class StakeActionProvider extends ActionProvider {
  constructor() {
    super("stake", []);
  }

  /**
   * Gets the stake balance.
   */
  @CreateAction({
    name: "get_stake_balance",
    description: [
      "This tool will return the stake balance including:",
      "- Number of staked tokens",
      "- Number of reward tokens",
    ].join("\n"),
    schema: GetStakeBalanceSchema,
  })
  async getStakeBalance(walletProvider: ViemWalletProvider): Promise<string> {
    try {
      // Get stake tokens
      const publicClient = createPublicClient({
        chain: sonic,
        transport: http(),
      });
      const stakeTokens = await publicClient.readContract({
        address: sonicConfig.contracts.stake,
        abi: stakeAbi,
        functionName: "getStake",
        args: [
          walletProvider.getAddress() as Address,
          BigInt(sonicConfig.stakeValidatorId),
        ],
      });

      // Get reward tokens
      const rewardTokens = BigInt(0); // TODO: Use contract to get this value

      return [
        "Stake balance:",
        `- Staked: ${formatEther(stakeTokens)} S`,
        `- Reward: ${formatEther(rewardTokens)} S`,
      ].join("\n");
    } catch (error) {
      return `Error getting stake balance: ${error}`;
    }
  }

  /**
   * Stakes tokens.
   */
  @CreateAction({
    name: "stake",
    description: [
      "This tool will stake native tokens.",
      "It takes the following inputs:",
      "- amount: The amount of native tokens to stake",
      "Important notes:",
      "- Ensure sufficient balance of tokens before staking",
    ].join("\n"),
    schema: StakeSchema,
  })
  async stake(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof StakeSchema>
  ): Promise<string> {
    try {
      // Send transaction to stake
      const hash = await walletProvider.sendTransaction({
        to: sonicConfig.contracts.stake,
        data: encodeFunctionData({
          abi: stakeAbi,
          functionName: "delegate",
          args: [BigInt(sonicConfig.stakeValidatorId)],
        }),
        value: parseEther(args.amount.toString()),
      });

      await walletProvider.waitForTransactionReceipt(hash);

      return `Staked ${args.amount} tokens`;
    } catch (error) {
      return `Error stake: ${error}`;
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
export const stakeActionProvider = () => new StakeActionProvider();
