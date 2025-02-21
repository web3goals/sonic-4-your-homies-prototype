import { ActionProvider, CreateAction } from "@coinbase/agentkit";
import { GetAirdropDetailsSchema } from "./schemas";

/**
 * An action provider with tools for airdrop.
 */
export class AirdropActionProvider extends ActionProvider {
  constructor() {
    super("airdrop", []);
  }

  /**
   * Gets the airdrop details.
   */
  @CreateAction({
    name: "get_airdrop_details",
    description:
      "This tool will return the details about airdrop including rules and balance.",
    schema: GetAirdropDetailsSchema,
  })
  async getAirdropDetails(): Promise<string> {
    try {
      const passivePoints = 0; // TODO: Use API to get this value

      return [
        "Airdrop Details:",
        "- Sonic Points are user-focused airdrop points that can be earned as part of the ~200 million S airdrop. Designed to boost liquidity on Sonic and strengthen its ecosystem, our points program positions Sonic as a premier hub for DeFi enthusiasts and users seeking to maximize the potential of their assets.",
        "- To earn Sonic Points, hold whitelisted assets. These points will be distributed over multiple seasons as NFT positions, ensuring long-term sustainability and preventing sudden supply shifts. The first season began with Sonic's launch and will conclude in June 2025.",
        "Whitelisted Assets:",
        "- scUSD",
        "Your balance:",
        `- ${passivePoints} Passive Points (PP)`,
      ].join("\n");
    } catch (error) {
      return `Error getting airdrop details: ${error}`;
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
