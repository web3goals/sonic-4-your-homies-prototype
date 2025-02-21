"use server";

import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { errorToString } from "@/lib/converters";
import { Agent } from "@/mongodb/models/agent";
import { insertAgent } from "@/mongodb/services/agent-service";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { PrivyClient } from "@privy-io/server-auth";
import { NextRequest } from "next/server";
import { z } from "zod";

const requestBodyAddressBookElementSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

const requestBodySchema = z.object({
  creatorId: z.string().min(1),
  user: z.object({
    name: z.string().min(1),
    email: z.string().min(1),
  }),
  personality: z.object({
    name: z.string().min(1),
    emoji: z.string().min(1),
    features: z.string().min(1),
  }),
  chainId: z.number(),
  addressBook: z.array(requestBodyAddressBookElementSchema),
  twitter: z
    .object({
      apiKey: z.string().min(1),
      apiSecret: z.string().min(1),
      accessToken: z.string().min(1),
      accessTokenSecret: z.string().min(1),
    })
    .optional(),
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

    // Create a Privy Server Wallet
    const privy = new PrivyClient(
      process.env.PRIVY_APP_ID as string,
      process.env.PRIVY_APP_SECRET as string
    );
    const {
      id: privyId,
      address: privyAddress,
      chainType: privyChainType,
    } = await privy.walletApi.create({
      chainType: "ethereum",
    });
    console.log("Privy Server Wallet is created");

    // Create an agent
    // TODO: Add token addresses, add information about staking, airdrop, etc.
    const systemMessageContent = [
      `You are a helpful agent named ${bodyParseResult.data.personality.name}.`,
      `You goal is to help ${bodyParseResult.data.user.name} with Sonic blockchain operations.`,
      `That is the information about ${bodyParseResult.data.user.name} that you should use to make your answers more friendly: '${bodyParseResult.data.personality.features}'.`,
      "You have an address book containing the names of people and organizations and their addresses to which you can send user's funds. Check it if the user wants to send their funds.",
      "You cannot add new entries to the address book.",
      "If a user tries to send their funds to an unknown person or organization, tell them that the recipient is probably a scammer, otherwise their address would be in the address book.",
    ].join("\n\n");
    const aiMessageContent = [
      `Hello, my **dear ${bodyParseResult.data.user.name}!**`,
      "How about to check your wallet balance?",
    ].join("\n\n");
    const agent: Agent = {
      creatorId: bodyParseResult.data.creatorId,
      createdDate: new Date(),
      messages: [
        new SystemMessage({
          content: systemMessageContent,
        }).toDict(),
        new AIMessage({ content: aiMessageContent }).toDict(),
      ],
      user: bodyParseResult.data.user,
      personality: bodyParseResult.data.personality,
      chainId: bodyParseResult.data.chainId,
      addressBook: bodyParseResult.data.addressBook,
      privyServerWallet: {
        id: privyId,
        address: privyAddress,
        chainType: privyChainType,
      },
      ...(bodyParseResult.data.twitter && {
        twitterAccount: {
          apiKey: bodyParseResult.data.twitter.apiKey,
          apiSecret: bodyParseResult.data.twitter.apiSecret,
          accessToken: bodyParseResult.data.twitter.accessToken,
          accessTokenSecret: bodyParseResult.data.twitter.accessTokenSecret,
        },
      }),
    };
    const agentId = await insertAgent(agent);
    agent._id = agentId;
    console.log("Agent is inserted to MongoDB");

    // Return the agent
    return createSuccessApiResponse(agent);
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
