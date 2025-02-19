import { z } from "zod";

import {
  ActionProvider,
  CreateAction,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import { GetWalletDetailsSchema, NativeTransferSchema } from "./schemas";
import { Address, formatEther } from "viem";
import { sonicTestnet } from "@/config/chains";

const DEFAULT_TERMINOLOGY = {
  unit: "",
  displayUnit: "",
  type: "Hash",
  verb: "transfer",
};

const SONIC_TERMINOLOGY = {
  unit: "WEI",
  displayUnit: "S",
  type: "Transaction hash",
  verb: "transaction",
};

const EVM_TERMINOLOGY = {
  unit: "WEI",
  displayUnit: "ETH",
  type: "Transaction hash",
  verb: "transaction",
};

const SVM_TERMINOLOGY = {
  unit: "LAMPORTS",
  displayUnit: "SOL",
  type: "Signature",
  verb: "transfer",
};

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
      let terminology = DEFAULT_TERMINOLOGY;
      if (network.chainId === sonicTestnet.id.toString()) {
        terminology = SONIC_TERMINOLOGY;
      } else if (network.protocolFamily === "evm") {
        terminology = EVM_TERMINOLOGY;
      } else if (network.protocolFamily === "svm") {
        terminology = SVM_TERMINOLOGY;
      }

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
      let terminology = DEFAULT_TERMINOLOGY;
      if (network.chainId === sonicTestnet.id.toString()) {
        terminology = SONIC_TERMINOLOGY;
      } else if (network.protocolFamily === "evm") {
        terminology = EVM_TERMINOLOGY;
      } else if (network.protocolFamily === "svm") {
        terminology = SVM_TERMINOLOGY;
      }

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
      let terminology = DEFAULT_TERMINOLOGY;
      if (network.chainId === sonicTestnet.id.toString()) {
        terminology = SONIC_TERMINOLOGY;
      } else if (network.protocolFamily === "evm") {
        terminology = EVM_TERMINOLOGY;
      } else if (network.protocolFamily === "svm") {
        terminology = SVM_TERMINOLOGY;
      }
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
  supportsNetwork = (): boolean => true;
}

/**
 * Factory function to create a new WalletActionProvider instance.
 *
 * @returns A new WalletActionProvider instance.
 */
export const walletActionProvider = () => new WalletActionProvider();
