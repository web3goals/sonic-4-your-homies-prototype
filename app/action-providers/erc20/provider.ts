import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { Address, encodeFunctionData, Hex, parseEther } from "viem";
import { z } from "zod";
import { erc20Abi } from "./abi/erc20";
import { GetErc20BalanceSchema, TransferErc20Schema } from "./schemas";

/**
 * An action provider with tools for ERC20 tokens.
 */
export class ERC20ActionProvider extends ActionProvider {
  constructor() {
    super("erc20", []);
  }

  /**
   * Gets the balance of an ERC20 token.
   *
   * @param walletProvider - The wallet provider to get the balance from.
   * @param args - The input arguments for the action.
   * @returns A message containing the balance.
   */
  @CreateAction({
    name: "get_erc_20_balance",
    description: `
  This tool will get the balance of an ERC20 asset in the wallet. It takes the contract address as input.
      `,
    schema: GetErc20BalanceSchema,
  })
  async getErc20Balance(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetErc20BalanceSchema>
  ): Promise<string> {
    try {
      const balance = await walletProvider.readContract({
        address: args.contractAddress as Hex,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [walletProvider.getAddress()],
      });

      return `Balance of ${args.contractAddress} is ${balance}`;
    } catch (error) {
      return `Error getting balance: ${error}`;
    }
  }

  /**
   * Transfers a specified amount of an ERC20 token to a destination onchain.
   *
   * @param walletProvider - The wallet provider to transfer the asset from.
   * @param args - The input arguments for the action.
   * @returns A message containing the transfer details.
   */
  @CreateAction({
    name: "transfer_erc20",
    description: `
  This tool will transfer an ERC20 token from the wallet to another onchain address.
  
  It takes the following inputs:
  - amount: The amount to transfer
  - contractAddress: The contract address of the token to transfer
  - destination: Where to send the funds (can be an onchain address, ENS 'example.eth', or Basename 'example.base.eth')
  
  Important notes:
  - Ensure sufficient balance of the input asset before transferring
  - When sending native assets (e.g. 'eth' on base-mainnet), ensure there is sufficient balance for the transfer itself AND the gas cost of this transfer
    `,
    schema: TransferErc20Schema,
  })
  async transferErc20(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof TransferErc20Schema>
  ): Promise<string> {
    try {
      // Send a transaction to transfer tokens
      const hash = await walletProvider.sendTransaction({
        to: args.contractAddress as Hex,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [
            args.destination as Address,
            parseEther(args.amount.toString()),
          ],
        }),
      });

      await walletProvider.waitForTransactionReceipt(hash);

      return `Transferred ${args.amount} of ${args.contractAddress} to ${args.destination}`;
    } catch (error) {
      return `Error transferring the asset: ${error}`;
    }
  }

  /**
   * Checks if the action provider supports the given network.
   *
   * @returns True if the action provider supports the network, false otherwise.
   */
  supportsNetwork = () => {
    return true;
  };
}

export const erc20ActionProvider = () => new ERC20ActionProvider();
