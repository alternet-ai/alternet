import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse, streamText } from "ai";

import { DEFAULT_PROMPT } from "~/app/static/prompts";

export const runtime = "edge";

interface MessageRequest {
  messages: CoreMessage[];
  basePage: string;
  model: string;
  lastIndex: number;
}


export async function POST(req: Request) {
  const { messages, basePage, lastIndex, model } = (await req.json()) as MessageRequest;


  let truncatedMessages: CoreMessage[] = [];

  // lastIndex is -1. this implies a refresh of the root page. todo: fix
  if (lastIndex == -1) {
    if (!messages[0]) {
      throw new Error("No messages provided");
    }
    truncatedMessages = [messages[0]];
  } else {

   const prompt = messages[messages.length - 1];
   if (!prompt) {
    throw new Error("Couldn't get last message - how?");
   }
   if (prompt.role !== "user") {
    throw new Error("Last message is not a user message");
   }
   if (typeof prompt.content !== "string") {
    throw new Error("Prompt content is not a string");
   }

   const lastUserMessage = messages[lastIndex*2];
   if (!lastUserMessage) {
    throw new Error("Couldn't get last user message - how?");
   }
   const lastAssistantMessage = messages[(lastIndex*2)+1];
   if (!lastAssistantMessage) {
    throw new Error("Couldn't get last assistant message - how?");
   }
   if (lastAssistantMessage.role !== "assistant") {
    throw new Error("Last assistant message is not an assistant message");
   }
   if (typeof lastAssistantMessage.content !== "string") {
    throw new Error("Last assistant message content is not a string");
   }

   const isEdit = lastAssistantMessage.content.includes("<replacementsToMake>");
   if (isEdit) {
    const extendedPromptContent = prompt.content + "\n<currentPage>\n" + basePage + "\n</currentPage>"
    truncatedMessages = [{...prompt, content: extendedPromptContent}] //the problem here is that it doesn't get the previous edits or the original page
   } else {
    truncatedMessages = [lastUserMessage, lastAssistantMessage, prompt];
   }
  }

  console.log('params', model, lastIndex, basePage.slice(0, 100))
  console.log('messages', messages.map((message) => ({ ...message, content: message.content.slice(0, 100).toString()})));
  console.log('truncatedMessages', truncatedMessages.map((message) => ({ ...message, content: message.content})));

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
