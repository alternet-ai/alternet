import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { defaultPrompt } from "~/app/static/prompts";

interface MessageRequest {
  messages: CoreMessage[];
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as MessageRequest;

  // Call the language model
  const result = await streamText({
    model: anthropic("claude-3-sonnet-20240229"),
    system: defaultPrompt,
    messages,
    temperature: 1,
  });

  // Respond with the stream
  return new StreamingTextResponse(result.toAIStream());
}
