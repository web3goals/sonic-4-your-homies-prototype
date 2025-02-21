import { ActionProvider, CreateAction } from "@coinbase/agentkit";
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
      "This tool will return the airdrop balance including passive points.",
    schema: GetAirdropBalanceSchema,
  })
  async getAirdropBalance(): Promise<string> {
    try {
      const passivePoints = 0; // TODO: Use API to get this value

      return [
        "Airdrop balance:",
        `- Passive Points (PP): ${passivePoints} `,
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
