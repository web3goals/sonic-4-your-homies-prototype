import { sonicConfig } from "@/config/sonic";
import {
  ActionProvider,
  CreateAction,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import { encodeFunctionData, parseEther, parseEventLogs } from "viem";
import { z } from "zod";
import { erc20FactoryAbi } from "./abi/erc20Factory";
import { CreateERC20Schema } from "./schemas";

/**
 * An action provider for the ERC20 factory contract.
 */
export class ERC20FactoryActionProvider extends ActionProvider {
  constructor() {
    super("erc20Factory", []);
  }

  /**
   * Create an ERC20 token.
   */
  @CreateAction({
    name: "create_erc20",
    description: [
      "This tool will create an ERC20 token.",
      "It takes the following inputs:",
      "- name: The name for the ERC20 token to create (e.g., 'Simon Cat Token')",
      "- symbol: The symbol for the ERC20 token to create (e.g., 'SCT')",
      "- amount: The amount of the ERC20 tokens to create",
    ].join("\n"),
    schema: CreateERC20Schema,
  })
  async createErc20(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof CreateERC20Schema>
  ): Promise<string> {
    try {
      // Send a transaction to create an ERC20 token
      const hash = await walletProvider.sendTransaction({
        to: sonicConfig.contracts.erc20Factory,
        data: encodeFunctionData({
          abi: erc20FactoryAbi,
          functionName: "createERC20",
          args: [args.name, args.symbol, parseEther(args.amount.toString())],
        }),
      });
      const receipt = await walletProvider.waitForTransactionReceipt(hash);

      // Parse logs to get a created contract address
      const logs = parseEventLogs({
        abi: erc20FactoryAbi,
        eventName: "ERC20Created",
        logs: receipt.logs,
      });
      const address = logs[0].args.erc20;

      return `ERC20 Token '${args.name}' is created, the contract address is ${address}`;
    } catch (error) {
      return `Error creating the asset: ${error}`;
    }
  }

  /**
   * Checks if the action provider supports the given network.
   */
  supportsNetwork = () => {
    return true;
  };
}

export const erc20FactoryActionProvider = () =>
  new ERC20FactoryActionProvider();
