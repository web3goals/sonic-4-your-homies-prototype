import { z } from "zod";

/**
 * Input schema for get ERC20 balance action.
 */
export const GetErc20BalanceSchema = z
  .object({
    contractAddress: z
      .string()
      .describe("The contract address of the token to get the balance for"),
  })
  .strip()
  .describe("Instructions for getting wallet balance");

/**
 * Input schema for transfer ERC20 action.
 */
export const TransferErc20Schema = z
  .object({
    amount: z.number().describe("The amount of the ERC20 asset to transfer"),
    contractAddress: z
      .string()
      .describe("The contract address of the ERC20 token to transfer"),
    destination: z
      .string()
      .describe("The destination to transfer the ERC20 tokens"),
  })
  .strip()
  .describe("Instructions for transferring ERC20 assets");
