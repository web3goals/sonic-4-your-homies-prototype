import { chainsConfig } from "@/config/chains";
import {
  ActionProvider,
  CreateAction,
  Network,
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
import { stakeAbi } from "./abi/stake";
import { GetStakeDetailsSchema, StakeSchema } from "./schemas";
import { z } from "zod";

/**
 * An action provider with tools for stake.
 */
export class StakeActionProvider extends ActionProvider {
  constructor() {
    super("stake", []);
  }

  /**
   * Gets the stake details.
   */
  @CreateAction({
    name: "get_stake_details",
    description: [
      "This tool will return the details about stake including:",
      "- Annual percentage rate (APR) value",
      "- Number of stake tokens",
      "- Number of reward tokens",
    ].join("\n"),
    schema: GetStakeDetailsSchema,
  })
  async getStakeDetails(walletProvider: ViemWalletProvider): Promise<string> {
    try {
      // Define chain config
      const sonicChainConfig = chainsConfig.find(
        (config) => config.chain.id === sonic.id
      );
      if (!sonicChainConfig) {
        return "Sonic chain config is not available";
      }

      // Get stake tokens
      const publicClient = createPublicClient({
        chain: sonic,
        transport: http(),
      });
      const stakeTokens = await publicClient.readContract({
        address: sonicChainConfig.contracts.stake,
        abi: stakeAbi,
        functionName: "getStake",
        args: [
          walletProvider.getAddress() as Address,
          BigInt(sonicChainConfig.stakeValidatorId),
        ],
      });

      // Get reward tokens
      const rewardTokens = BigInt(0); // TODO: Use contract to get this value

      return [
        "Stake Details:",
        "- You can stake S. Staking your S involves a 14-day waiting period if you choose to withdraw.",
        "- Annual percentage rate (APR) is 5.81%.",
        "Your stake tokens:",
        `- ${formatEther(stakeTokens)} S`,
        "Your reward tokens:",
        `- ${formatEther(rewardTokens)} S`,
      ].join("\n");
    } catch (error) {
      return `Error getting stake details: ${error}`;
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
      // Define chain config
      const sonicChainConfig = chainsConfig.find(
        (config) => config.chain.id === sonic.id
      );
      if (!sonicChainConfig) {
        return "Sonic chain config is not available";
      }

      // Send transaction to stake
      const hash = await walletProvider.sendTransaction({
        to: sonicChainConfig.contracts.stake,
        data: encodeFunctionData({
          abi: stakeAbi,
          functionName: "delegate",
          args: [BigInt(sonicChainConfig.stakeValidatorId)],
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
  supportsNetwork = (network: Network) => {
    return network.chainId == sonic.id.toString();
  };
}

/**
 * Factory function to create a new action provider instance.
 */
export const stakeActionProvider = () => new StakeActionProvider();
