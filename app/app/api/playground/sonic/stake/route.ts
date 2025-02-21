"use server";

import { stakeAbi } from "@/action-providers/stake/abi/stake";
import { sonicConfig } from "@/config/sonic";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { errorToString } from "@/lib/converters";
import { PrivyClient } from "@privy-io/server-auth";
import { createViemAccount } from "@privy-io/server-auth/viem";
import { NextRequest } from "next/server";
import {
  Address,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  parseEther,
} from "viem";
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

    // Define public client
    const publicClient = createPublicClient({
      chain: sonic,
      transport: http(),
    });

    // Get stake
    const stake = await publicClient.readContract({
      address: sonicConfig.contracts.stake,
      abi: stakeAbi,
      functionName: "getStake",
      args: [
        bodyParseResult.data.privyServerWalletAddress as Address,
        BigInt(sonicConfig.stakeValidatorId),
      ],
    });
    console.log({ stake });

    // Send transaction to stake
    const hash = await walletClient.sendTransaction({
      to: sonicConfig.contracts.stake,
      data: encodeFunctionData({
        abi: stakeAbi,
        functionName: "delegate",
        args: [BigInt(sonicConfig.stakeValidatorId)],
      }),
      value: parseEther("0.1"),
    });
    console.log({ hash });

    return createSuccessApiResponse("Ok");
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
