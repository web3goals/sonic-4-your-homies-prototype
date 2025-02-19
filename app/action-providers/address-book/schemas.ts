import { z } from "zod";

/**
 * Input schema for get the address book records action.
 */
export const GetAddressBookRecordsSchema = z
  .object({})
  .strip()
  .describe("Instructions for getting the address book records");
