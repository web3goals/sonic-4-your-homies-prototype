"use server";

import { sonicConfig } from "@/config/sonic";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { errorToString } from "@/lib/converters";
import { PrivyClient } from "@privy-io/server-auth";
import { createViemAccount } from "@privy-io/server-auth/viem";
import axios from "axios";
import { NextRequest } from "next/server";
import { Address, createWalletClient, http, parseEther } from "viem";
import { sonic } from "viem/chains";
import { z } from "zod";

const requestBodySchema = z.object({
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
      "https://deswap.debridge.finance/v1.0/chain/transaction",
      {
        params: {
          chainId: "100000014",
          tokenIn: "0x0000000000000000000000000000000000000000",
          tokenInAmount: parseEther("0.15").toString(),
          tokenOut: sonicConfig.contracts.scUSD,
          tokenOutRecipient: bodyParseResult.data.privyServerWalletAddress,
          tab: new Date().getTime(),
        },
      }
    );
    const swapTxData = {
      data: data.tx.data,
      to: data.tx.to,
      value: BigInt(data.tx.value),
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
      chain: sonic,
      transport: http(),
    });

    const swapTxHash = await walletClient.sendTransaction({
      data: swapTxData.data,
      to: swapTxData.to,
      value: swapTxData.value,
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
