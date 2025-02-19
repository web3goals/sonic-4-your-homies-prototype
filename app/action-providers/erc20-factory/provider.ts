import {
  ActionProvider,
  CreateAction,
  Network,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import {
  Address,
  encodeFunctionData,
  Hex,
  parseEther,
  parseEventLogs,
} from "viem";
import { z } from "zod";
import { erc20FactoryAbi } from "./abi/erc20Factory";
import { CreateERC20Schema } from "./schemas";

/**
 * An action provider for creating ERC20 tokens.
 */
export class ERC20FactoryActionProvider extends ActionProvider {
  erc20FactoryContracts: Map<string, Address>;

  constructor(args: { erc20FactoryContracts: Map<string, Address> }) {
    super("erc20Factory", []);
    this.erc20FactoryContracts = args.erc20FactoryContracts;
  }

  /**
   * Create an ERC20 token.
   *
   * @param walletProvider - The wallet provider.
   * @param args - The input arguments for the action.
   * @returns A message containing the action details.
   */
  @CreateAction({
    name: "create_erc20",
    description: `
  This tool will create an ERC20 token.
  
  It takes the following inputs:
  - name: The name for the ERC20 token to create (e.g., 'Simon Cat Token')
  - symbol: The symbol for the ERC20 token to create (e.g., 'SCT')
  - amount: The amount of the ERC20 tokens to create
          `,
    schema: CreateERC20Schema,
  })
  async createErc20(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof CreateERC20Schema>
  ): Promise<string> {
    try {
      // Get chain ID
      const chainId = walletProvider.getNetwork().chainId;
      if (!chainId) {
        return "Network chainId is not available";
      }
      // Get ERC20 Factory contract address
      const erc20Factory = this.erc20FactoryContracts.get(chainId as string);
      if (!erc20Factory) {
        return "ERC20 Factory contract address is not available";
      }
      // Send a transaction to create an ERC20 token
      const hash = await walletProvider.sendTransaction({
        to: erc20Factory as Hex,
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
   *
   * @returns True if the action provider supports the network, false otherwise.
   */
  supportsNetwork = (network: Network) => {
    if (!network?.chainId) {
      return false;
    }
    return this.erc20FactoryContracts.has(network.chainId);
  };
}

export const erc20FactoryActionProvider = (args: {
  erc20FactoryContracts: Map<string, Address>;
}) => new ERC20FactoryActionProvider(args);
