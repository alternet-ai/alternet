import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import { HOME_ID, HOME_PAGE } from "~/app/static/constants";
import { api } from "~/trpc/server";

export const runtime = "edge";

const VARIANTS_PROMPT = `You will be given the full contents of a web page.
Based on the contents, generate about six specific ideas for edits to the current page.
These edits should offer different styles, layouts, or changes to the current page content.
Some might be visual, some might be creative, some might be expansions of the current content.
Do a few normal ones, then a few zany ones.
All edits should be possible by modifying the current page with simple html/css/javascript. Do not use other resources (videos, audio, images, etc).
Make each edit distinct and engaging.
Edits should be very short, direct, and to the point - no filler words. Try for 10 words or less.
Return the edits as a JSON array of strings.`;

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

  let variants: string[] = [];
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
      system: VARIANTS_PROMPT,
      messages,
      temperature: 1,
      maxTokens: 4096,
    });

    console.log(result.text);

    const jsonBody = result.text.split("[")[1]?.split("]")[0];
    if (!jsonBody) {
      throw new Error(
        "could not parse json from returned variants: " + result.text,
      );
    }
    const relevantText = "[" + jsonBody + "]";

    variants = JSON.parse(relevantText) as string[];
    console.log(variants);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ variants: [] }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify({ variants }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
