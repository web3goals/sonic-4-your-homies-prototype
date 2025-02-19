import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { z } from "zod";
import { GetAddressBookAddressSchema } from "./schemas";

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
   * Gets the address of a person or organization from the address book.
   *
   * @param walletProvider - The wallet provider.
   * @param args - The input arguments for the action.
   * @returns A message containing the address.
   */
  @CreateAction({
    name: "get_address_book_address",
    description: `
This tool will get the address of a person or organization from the address book.
It takes the name of a person or organization.
    `,
    schema: GetAddressBookAddressSchema,
  })
  async getAddress(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetAddressBookAddressSchema>
  ): Promise<string> {
    try {
      const record = this.addressBook.find(
        (record) => record.name === args.name
      );
      if (!record) {
        return `There's no address for ${args.name} in the address book`;
      }
      return `Address of ${args.name} is ${record.address}`;
    } catch (error) {
      return `Error getting address: ${error}`;
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
