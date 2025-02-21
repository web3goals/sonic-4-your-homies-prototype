"use server";

import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getChainById } from "@/lib/chains";
import { errorToString } from "@/lib/converters";
import { PrivyClient } from "@privy-io/server-auth";
import { createViemAccount } from "@privy-io/server-auth/viem";
import axios from "axios";
import { NextRequest } from "next/server";
import { Address, createWalletClient, http, parseEther } from "viem";
import { z } from "zod";

const requestBodySchema = z.object({
  chainId: z.number(),
  privyServerWalletId: z.string().min(1),
  privyServerWalletAddress: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Get and parse request data
    const body = await request.json();
    const bodyParseResult = requestBodySchema.safeParse(body);
    if (!bodyParseResult.success) {
      return createFailedApiResponse(
        {
          message: `Request body invalid: ${JSON.stringify(bodyParseResult)}`,
        },
        400
      );
    }

    // Get data for swap transaction
    const { data } = await axios.get(
      "https://dln.debridge.finance/v1.0/chain/transaction",
      {
        params: {
          chainId: "100000014",
          tokenIn: "0x0000000000000000000000000000000000000000",
          tokenInAmount: parseEther("0.01").toString(),
          tokenOut: "0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE",
          tokenOutRecipient: bodyParseResult.data.privyServerWalletAddress,
        },
      }
    );
    const swapTxData = {
      data: data.tx.data,
      to: data.tx.to,
      value: data.tx.value,
    };

    // Define wallet client
    const privy = new PrivyClient(
      process.env.PRIVY_APP_ID as string,
      process.env.PRIVY_APP_SECRET as string
    );
    const account = await createViemAccount({
      walletId: bodyParseResult.data.privyServerWalletId,
      address: bodyParseResult.data.privyServerWalletAddress as Address,
      privy,
    });
    const walletClient = createWalletClient({
      account,
      chain: getChainById(bodyParseResult.data.chainId),
      transport: http(),
    });

    // Send swap transaction
    const swapTxRequest = await walletClient.prepareTransactionRequest({
      to: swapTxData.to,
      value: swapTxData.value,
      data: swapTxData.data,
    });
    const serializedSwapTx = await walletClient.signTransaction(swapTxRequest);
    const swapTxHash = await walletClient.sendRawTransaction({
      serializedTransaction: serializedSwapTx,
    });

    return createSuccessApiResponse({ swapTxHash });
  } catch (error) {
    console.error(
      `Failed to process ${request.method} request for "${
        new URL(request.url).pathname
      }":`,
      errorToString(error)
    );
    return createFailedApiResponse(
      { message: "Internal server error, try again later" },
      500
    );
  }
}
