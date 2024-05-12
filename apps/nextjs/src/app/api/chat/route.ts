import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { DEFAULT_PROMPT } from "~/app/static/prompts";

export const runtime = "edge";

interface MessageRequest {
  messages: CoreMessage[];
  model: string;
}


export async function POST(req: Request) {
  const { messages, model } = (await req.json()) as MessageRequest;

  // Call the language model
  const result = await streamText({
    model: anthropic(model),
    system: DEFAULT_PROMPT,
    messages,
    temperature: 1,
    maxTokens: 4096,
  });

  // Respond with the stream
  return new StreamingTextResponse(result.toAIStream());
}
