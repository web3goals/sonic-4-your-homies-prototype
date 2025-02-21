import { z } from "zod";

import { sonicConfig } from "@/config/sonic";
import {
  ActionProvider,
  CreateAction,
  Network,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import { Address, formatEther } from "viem";
import { GetWalletDetailsSchema, NativeTransferSchema } from "./schemas";

/**
 * WalletActionProvider provides actions for getting basic wallet information.
 */
export class WalletActionProvider extends ActionProvider {
  /**
   * Constructor for the WalletActionProvider.
   */
  constructor() {
    super("wallet", []);
  }

  /**
   * Gets the details of the connected wallet including address, network, and balance.
   *
   * @param walletProvider - The wallet provider to get the details from.
   * @param _ - Empty args object (not used).
   * @returns A formatted string containing the wallet details.
   */
  @CreateAction({
    name: "get_wallet_details",
    description: `
    This tool will return the details of the connected wallet including:
    - Wallet address
    - Network information (protocol family, network ID, chain ID)
    - Native token balance (ETH for EVM networks, S for Sonic network, SOL for Solana networks)
    - Wallet provider name
    `,
    schema: GetWalletDetailsSchema,
  })
  async getWalletDetails(walletProvider: ViemWalletProvider): Promise<string> {
    try {
      const address = walletProvider.getAddress();
      const network = walletProvider.getNetwork();
      const balance = await walletProvider.getBalance();
      const name = walletProvider.getName();
      const terminology = this.getTerminology(network);

      return [
        "Wallet Details:",
        `- Provider: ${name}`,
        `- Address: ${address}`,
        "- Network:",
        `  * Protocol Family: ${network.protocolFamily}`,
        `  * Network ID: ${network.networkId || "N/A"}`,
        `  * Chain ID: ${network.chainId || "N/A"}`,
        `- Native Balance: ${balance.toString()} ${terminology.unit}`,
        `- Display Balance: ${formatEther(balance)} ${terminology.displayUnit}`,
      ].join("\n");
    } catch (error) {
      return `Error getting wallet details: ${error}`;
    }
  }

  /**
   * Transfers a specified amount of native currency to a destination onchain.
   *
   * @param walletProvider - The wallet provider to transfer from.
   * @param args - The input arguments for the action.
   * @returns A message containing the transfer details.
   */
  @CreateAction({
    name: "native_transfer",
    description: `
This tool will transfer native tokens from the wallet to another onchain address.

It takes the following inputs:
- amount: The amount to transfer in whole units (e.g. 1 ETH, 1 S, 0.1 SOL)
- destination: The address to receive the funds

Important notes:
- Ensure sufficient balance of the input asset before transferring
- Ensure there is sufficient native token balance for gas fees
    `,
    schema: NativeTransferSchema,
  })
  async nativeTransfer(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof NativeTransferSchema>
  ): Promise<string> {
    try {
      const network = walletProvider.getNetwork();
      const terminology = this.getTerminology(network);

      if (network.protocolFamily === "evm" && !args.to.startsWith("0x")) {
        args.to = `0x${args.to}`;
      }

      const result = await walletProvider.nativeTransfer(
        args.to as Address,
        args.value
      );
      return [
        `Transferred ${args.value} ${terminology.displayUnit} to ${args.to}`,
        `${terminology.type}: ${result}`,
      ].join("\n");
    } catch (error) {
      const network = walletProvider.getNetwork();
      const terminology = this.getTerminology(network);
      return `Error during ${terminology.verb}: ${error}`;
    }
  }

  /**
   * Checks if the wallet action provider supports the given network.
   * Since wallet actions are network-agnostic, this always returns true.
   *
   * @param _ - The network to check.
   * @returns True, as wallet actions are supported on all networks.
   */
  supportsNetwork = () => {
    return true;
  };

  /**
   * Returns the terminology for the given network.
   */
  getTerminology(network: Network): {
    unit: string;
    displayUnit: string;
    type: string;
    verb: string;
  } {
    if (network.chainId == sonicConfig.chain.id.toString()) {
      return {
        unit: "WEI",
        displayUnit: "S",
        type: "Transaction hash",
        verb: "transaction",
      };
    }
    if (network.protocolFamily === "evm") {
      return {
        unit: "WEI",
        displayUnit: "ETH",
        type: "Transaction hash",
        verb: "transaction",
      };
    }
    if (network.protocolFamily === "svm") {
      return {
        unit: "LAMPORTS",
        displayUnit: "SOL",
        type: "Signature",
        verb: "transfer",
      };
    }
    return {
      unit: "",
      displayUnit: "",
      type: "Hash",
      verb: "transfer",
    };
  }
}

/**
 * Factory function to create a new WalletActionProvider instance.
 *
 * @returns A new WalletActionProvider instance.
 */
export const walletActionProvider = () => new WalletActionProvider();
