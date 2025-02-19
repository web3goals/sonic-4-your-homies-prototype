"use server";

import { createFailedApiResponse, createSuccessApiResponse } from "@/lib/api";
import { errorToString } from "@/lib/converters";
import { findAgent } from "@/mongodb/services/agent-service";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(
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

    // Load agent data using MongoDB
    const agent = await findAgent(new ObjectId(id));
    if (!agent) {
      return createFailedApiResponse({ message: "Not found" }, 404);
    }

    // Check that the user has access to the agent
    if (authorization.split(" ")[1] !== agent.user.email) {
      return createFailedApiResponse({ message: "Access denied" }, 401);
    }

    // Return agent data
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
