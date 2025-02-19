import { z } from "zod";

/**
 * Input schema for create ERC20 action.
 */
export const CreateERC20Schema = z
  .object({
    name: z.string().describe("The name for the ERC20 token to create"),
    symbol: z.string().describe("The symbol for the ERC20 token to create"),
    amount: z.number().describe("The amount of the ERC20 tokens to create"),
  })
  .strip()
  .describe("Instructions for transferring ERC20 assets");
