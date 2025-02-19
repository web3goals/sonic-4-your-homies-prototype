import { z } from "zod";

/**
 * Input schema for get address from the address book action.
 */
export const GetAddressBookAddressSchema = z
  .object({
    name: z
      .string()
      .describe(
        "The name of a person or organization in the address book, e.g., 'Alice' or 'Kindness Network'"
      ),
  })
  .strip()
  .describe(
    "Instructions for getting an address of a person or organization from the address book"
  );
