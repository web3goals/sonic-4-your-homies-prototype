"use server";

import { erc20FactoryActionProvider } from "@/action-providers/erc20-factory/provider";
import { twitterActionProvider } from "@/action-providers/twitter/provider";
import { chainsConfig } from "@/config/chains";
import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { getChainById } from "@/lib/chains";
import { errorToString } from "@/lib/converters";
import { findAgent, updateAgent } from "@/mongodb/services/agent-service";
import {
  AgentKit,
  ViemWalletProvider,
  walletActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import {
  HumanMessage,
  mapStoredMessagesToChatMessages,
} from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { PrivyClient } from "@privy-io/server-auth";
import { createViemAccount } from "@privy-io/server-auth/viem";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { createWalletClient, Hex, http } from "viem";
import { z } from "zod";

const requestBodySchema = z.object({
  message: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get and parse request data
    const { id } = await params;
    const authorization = (await headers()).get("Authorization");
    if (!authorization) {
      return createFailedApiResponse(
        { message: "Request headers invalid: Authorization is undefined" },
        400
      );
    }
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

    // Load agent data using MongoDB
    const agent = await findAgent(new ObjectId(id));
    if (!agent) {
      return createFailedApiResponse({ message: "Not found" }, 404);
    }

    // Check that the user has access to the agent
    if (authorization.split(" ")[1] !== agent.user.email) {
      return createFailedApiResponse({ message: "Access denied" }, 401);
    }

    // Get a agent viem account from a Privy server wallet
    const privy = new PrivyClient(
      process.env.PRIVY_APP_ID as string,
      process.env.PRIVY_APP_SECRET as string
    );
    const account = await createViemAccount({
      walletId: agent.privyServerWallet.id,
      address: agent.privyServerWallet.address as Hex,
      privy,
    });

    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    // Initialize AgentKit with tools
    const client = createWalletClient({
      account,
      chain: getChainById(agent.chainId),
      transport: http(),
    });
    const walletProvider = new ViemWalletProvider(client);
    const agentKit = await AgentKit.from({
      walletProvider: walletProvider,
      actionProviders: [
        walletActionProvider(),
        erc20FactoryActionProvider({
          erc20FactoryContracts: new Map(
            chainsConfig.map((chainConfig) => [
              chainConfig.chain.id.toString(),
              chainConfig.contracts.erc20Factory,
            ])
          ),
        }),
        ...(agent.twitterAccount
          ? [
              twitterActionProvider({
                apiKey: agent.twitterAccount.apiKey,
                apiSecret: agent.twitterAccount.apiSecret,
                accessToken: agent.twitterAccount.accessToken,
                accessTokenSecret: agent.twitterAccount.accessTokenSecret,
              }),
            ]
          : []),
      ],
      cdpApiKeyName: process.env.CDP_API_KEY_NAME,
      cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    });
    const agentKitTools = await getLangChainTools(agentKit);

    // Create an agent
    const reactAgent = createReactAgent({
      llm: llm,
      tools: agentKitTools,
    });

    // Use the agent
    const result = await reactAgent.invoke(
      {
        messages: [
          ...mapStoredMessagesToChatMessages(agent.messages),
          new HumanMessage({ content: bodyParseResult.data?.message }),
        ],
      },
      { configurable: { thread_id: 42 } }
    );
    const resultMessages = result.messages.map((message) => message.toDict());

    // Update agent data in MongoDB
    await updateAgent({
      id: agent._id as ObjectId,
      newMessages: resultMessages,
    });

    // Return the agent answer
    // return createSuccessApiResponse(result.messages.at(-1)?.content);
    return createSuccessApiResponse(resultMessages);
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
