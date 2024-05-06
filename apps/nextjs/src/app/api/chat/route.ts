import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { DEFAULT_PROMPT } from "~/app/static/prompts";

interface MessageRequest {
  messages: CoreMessage[];
  lastIndex: number;
}

export async function POST(req: Request) {
  const { messages, lastIndex } = (await req.json()) as MessageRequest;

  const startIndex = lastIndex * 2;
  let truncatedMessages = messages;

  // lastIndex is -1. this implies a refresh of the root page
  if (lastIndex == -1) {
    if (!messages[0]) {
      throw new Error("No messages provided");
    }
    truncatedMessages = [messages[0]];
  } else {
    truncatedMessages = messages.slice(startIndex, startIndex + 3);
  }

  console.log(truncatedMessages);

  // Call the language model
  const result = await streamText({
    model: anthropic("claude-3-sonnet-20240229"),
    system: DEFAULT_PROMPT,
    messages: truncatedMessages,
    temperature: 1,
    maxTokens: 4096,
  });

  // Respond with the stream
  return new StreamingTextResponse(result.toAIStream());
}
