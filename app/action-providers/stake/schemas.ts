import { z } from "zod";

/**
 * Schema for the get stake details action.
 */
export const GetStakeDetailsSchema = z.object({});

/**
 * Schema for the stake action.
 */
export const StakeSchema = z
  .object({
    amount: z.number().describe("The amount of native tokens to stake"),
  })
  .strip()
  .describe("Instructions for staking native tokens");
