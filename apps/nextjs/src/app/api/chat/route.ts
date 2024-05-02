import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { defaultPrompt } from "~/app/static/prompts";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Call the language model
  const result = await streamText({
    model: anthropic("claude-3-haiku-20240307"),
    system: defaultPrompt,
    messages,
  });

  // Respond with the stream
  return new StreamingTextResponse(result.toAIStream())
}
