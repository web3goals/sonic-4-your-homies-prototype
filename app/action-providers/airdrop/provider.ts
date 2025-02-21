import {
  ActionProvider,
  CreateAction,
  ViemWalletProvider,
} from "@coinbase/agentkit";
import axios from "axios";
import { GetAirdropBalanceSchema } from "./schemas";

/**
 * An action provider with tools for airdrop.
 */
export class AirdropActionProvider extends ActionProvider {
  constructor() {
    super("airdrop", []);
  }

  /**
   * Gets the airdrop balance.
   */
  @CreateAction({
    name: "get_airdrop_balance",
    description:
      "This tool will return the airdrop balance including total points, passive points, active points, rank",
    schema: GetAirdropBalanceSchema,
  })
  async getAirdropBalance(walletProvider: ViemWalletProvider): Promise<string> {
    try {
      // Send request to Sonic dashboard
      const { data } = await axios.get(
        "https://www.data-openblocklabs.com/sonic/user-points-stats",
        { params: { wallet_address: walletProvider.getAddress() } }
      );

      return [
        "Airdrop balance:",
        `- Total Points (Sonic Points): ${data.sonic_points} `,
        `- Passive Points (PP): ${data.passive_liquidity_points} `,
        `- Active Points (PP): ${data.active_liquidity_points} `,
        `- Rank: ${data.rank} `,
      ].join("\n");
    } catch (error) {
      return `Error getting airdrop balance: ${error}`;
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
export const airdropActionProvider = () => new AirdropActionProvider();
