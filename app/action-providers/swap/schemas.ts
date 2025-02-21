import { z } from "zod";

/**
 * Schema for the swap S for scUSD action.
 */
export const SwapSForScUSDSchema = z
  .object({
    amount: z
      .number()
      .describe("The amount of native tokens to swap for scUSD tokens"),
  })
  .strip()
  .describe("Instructions for swaping native tokens for scUSD tokens");
