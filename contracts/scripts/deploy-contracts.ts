import hre from "hardhat";
import { Hex } from "viem";
import ERC20Factory from "../artifacts/contracts/ERC20Factory.sol/ERC20Factory.json";
import { sonicTestnet } from "./data/chains";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  if (network !== "sonicTestnet") {
    throw new Error("This script can only be run on the Sonic Testnet");
  }

  // Define public client
  const publicClient = await hre.viem.getPublicClient({
    chain: sonicTestnet,
  });

  // Define wallet client
  const walletClients = await hre.viem.getWalletClients({
    chain: sonicTestnet,
  });
  const walletClient = walletClients[0];
  if (!walletClient) {
    throw new Error("No wallet client found");
  }

  // Deploy ERC20Factory contract
  if (!CONTRACTS[network].erc20Factory) {
    const hash = await walletClient.deployContract({
      abi: ERC20Factory.abi,
      bytecode: ERC20Factory.bytecode as Hex,
      args: [],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(
      `Contract 'ERC20Factory' deployed to: ${receipt.contractAddress}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
