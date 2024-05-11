import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { DEFAULT_PROMPT } from "~/app/static/prompts";

export const runtime = "edge";

interface MessageRequest {
  messages: CoreMessage[];
  lastIndex: number;
  model: string;
}

const LAST_N_SITES = 1;

export async function POST(req: Request) {
  const { messages, lastIndex, model } = (await req.json()) as MessageRequest;

  console.log(messages.map((message) => ({ ...message, content: message.content.slice(0, 100) })), lastIndex, model);

  let truncatedMessages: CoreMessage[] = [];

  // lastIndex is -1. this implies a refresh of the root page
  if (lastIndex == -1) {
    if (!messages[0]) {
      throw new Error("No messages provided");
    }
    truncatedMessages = [messages[0]];
  } else {
    const relevantMessages = messages.slice(0, (lastIndex + 1) * 2);
    const assistantMessages = relevantMessages.filter(
      (message) => message.role === "assistant",
    );
    const siteMessages = assistantMessages.filter((message) =>
      !message.content.toString().includes("<replacementsToMake>"),
    );
    const lastSiteMessage = siteMessages.slice(-1 * LAST_N_SITES)[0];
    if (!lastSiteMessage) {
      throw new Error("Could not get last site message");
    }

    const lastSiteIndex = relevantMessages.indexOf(lastSiteMessage);

    truncatedMessages = relevantMessages.slice(lastSiteIndex-1);

    const prompt = messages[messages.length - 1];
    if (!prompt) {
      throw new Error("Couldn't get last message - how?");
    }
    truncatedMessages.push(prompt);
  }

  console.log(truncatedMessages.map((message) => ({ ...message, content: message.content.slice(0, 100) })));

  // Call the language model
  const result = await streamText({
    model: anthropic(model),
    system: DEFAULT_PROMPT,
    messages: truncatedMessages,
    temperature: 1,
    maxTokens: 4096,
  });

  // Respond with the stream
  return new StreamingTextResponse(result.toAIStream());
}
