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
  if (messages.length > 3) {
    truncatedMessages = messages.slice(startIndex, startIndex + 3);
  } else if (messages.length === 3) {
    const lastMessage = messages.pop();
    if (!lastMessage) {
      throw new Error("No last message lol how??");
    }
    truncatedMessages = [lastMessage];
  } else {
    throw new Error(
      `Messages should always be 3 or more. how did you get here? ${JSON.stringify(
        messages,
      )}`,
    );
  }

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
