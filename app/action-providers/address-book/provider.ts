import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { z } from "zod";
import { GetAddressBookRecordsSchema } from "./schemas";

/**
 * An action provider with tools for the address book.
 */
export class AddressBookActionProvider extends ActionProvider {
  addressBook: { name: string; address: string }[];

  constructor(args: { addressBook: { name: string; address: string }[] }) {
    super("addressBook", []);
    this.addressBook = args.addressBook;
  }

  /**
   * Get the records from the address book.
   *
   * @param walletProvider - The wallet provider.
   * @param args - The input arguments for the action.
   * @returns A message containing the address.
   */
  @CreateAction({
    name: "get_address_book_records",
    description: `
This tool will get the address book records.
    `,
    schema: GetAddressBookRecordsSchema,
  })
  async getRecords(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetAddressBookRecordsSchema>
  ): Promise<string> {
    try {
      const addressBookRecords = this.addressBook.map(
        (record) => `${record.name},${record.address}`
      );
      return `Address book records:\n${addressBookRecords.join("\n")}`;
    } catch (error) {
      return `Error getting address book records: ${error}`;
    }
  }

  /**
   * Checks if the action provider supports the given network.
   *
   * @returns True if the action provider supports the network, false otherwise.
   */
  supportsNetwork = () => {
    return true;
  };
}

export const addressBookActionProvider = (args: {
  addressBook: { name: string; address: string }[];
}) => new AddressBookActionProvider(args);
