import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { defaultPrompt } from "~/app/static/prompts";

interface MessageRequest {
  messages: CoreMessage[];
  lastIndex: number;
}

export async function POST(req: Request) {
  const { messages, lastIndex } = (await req.json()) as MessageRequest;
  const startIndex = lastIndex*2;
  const truncatedMessages = messages.slice(startIndex, startIndex+3);

  // Call the language model
  const result = await streamText({
    model: anthropic("claude-3-haiku-20240307"),
    system: defaultPrompt,
    messages: truncatedMessages,
    temperature: 1,
  });

  // Respond with the stream
  return new StreamingTextResponse(result.toAIStream());
}
