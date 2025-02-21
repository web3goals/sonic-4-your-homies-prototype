import hre from "hardhat";
import { Hex } from "viem";
import ERC20Factory from "../artifacts/contracts/ERC20Factory.sol/ERC20Factory.json";
import { sonicTestnet } from "./data/chains";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  // Deploy ERC20Factory contract
  if (!CONTRACTS[network].erc20Factory) {
    let contractAddress = undefined;

    // Deploy contract on sonicTestnet
    if (network === "sonicTestnet") {
      const walletClients = await hre.viem.getWalletClients({
        chain: sonicTestnet,
      });
      const walletClient = walletClients[0];
      if (!walletClient) {
        throw new Error("No wallet client found");
      }
      const hash = await walletClient.deployContract({
        abi: ERC20Factory.abi,
        bytecode: ERC20Factory.bytecode as Hex,
        args: [],
      });
      const publicClient = await hre.viem.getPublicClient({
        chain: sonicTestnet,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      contractAddress = receipt.contractAddress;
    }
    // Deploy contract on other networks
    else {
      const contract = await hre.viem.deployContract("ERC20Factory", []);
      contractAddress = contract.address;
    }

    console.log(`Contract 'ERC20Factory' deployed to: ${contractAddress}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
