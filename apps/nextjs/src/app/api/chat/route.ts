import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { DEFAULT_PROMPT } from "~/app/static/prompts";

export const runtime = "edge";

interface MessageRequest {
  messages: CoreMessage[];
  lastIndex: number;
}

const LAST_N_SITES = 1;

export async function POST(req: Request) {
  const { messages, lastIndex } = (await req.json()) as MessageRequest;

  const startIndex = (lastIndex - LAST_N_SITES + 1) * 2;
  const endIndex = startIndex + 2 * LAST_N_SITES;
  
  let truncatedMessages: CoreMessage[] = [];

  // lastIndex is -1. this implies a refresh of the root page
  if (lastIndex == -1) {
    if (!messages[0]) {
      throw new Error("No messages provided");
    }
    truncatedMessages = [messages[0]];
  } else {
    truncatedMessages = messages.slice(startIndex, endIndex);
    const prompt = messages[messages.length - 1];
    if (!prompt) {
      throw new Error("Couldn't get last message - how?");
    }
    truncatedMessages.push(prompt);
  }

  // Call the language model
  const result = await streamText({
    model: anthropic("claude-3-sonnet-20240229"), //TODO: allow opus
    system: DEFAULT_PROMPT,
    messages: truncatedMessages,
    temperature: 1,
    maxTokens: 4096,
  });

  // Respond with the stream
  return new StreamingTextResponse(result.toAIStream());
}
