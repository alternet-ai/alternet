import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import { HOME_ID, HOME_PAGE } from "~/app/static/constants";
import { api } from "~/trpc/server";

export const runtime = "edge";

const SUGGESTIONS_PROMPT = `You will be given the full contents of a web page.
Based on the contents, generate several contextual suggestions for further explorations. 
These suggestions can either be other web pages, or improvements for the current page.
Try to generate suggestions that suggest intriguing rabbitholes or otherwise encourage fun & engagement.
Suggestions should be very short, direct, and to the point - no filler words. Try for 10 words or less.
Return the suggestions as a JSON array of strings.`;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ imageUrl: null }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  let suggestions: string[] = [];
  try {
    let page;
    if (id === HOME_ID) {
      page = HOME_PAGE;
    } else {
      page = await api.page.load(id);
    }
    if (!page) {
      throw new Error("Page not found");
    }

    const messages: CoreMessage[] = [{ role: "user", content: page.content }];

    const result = await generateText({
      model: anthropic("claude-3-sonnet-20240229"),
      system: SUGGESTIONS_PROMPT,
      messages,
      temperature: 1,
      maxTokens: 4096,
    });

    const jsonBody = result.text.split("[")[1]?.split("]")[0]
    if (!jsonBody) {
      throw new Error("could not parse json from returned suggestions: " + result.text);
    }
    const relevantText = "[" + jsonBody + "]";

    suggestions = JSON.parse(relevantText) as string[];
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({suggestions: []}), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
