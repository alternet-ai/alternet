import type { CoreMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

import { HOME_ID, HOME_PAGE } from "~/app/static/constants";
import { api } from "~/trpc/server";

export const runtime = "edge";

const VARIANTS_PROMPT = `You will be given the full contents of a web page.
Based on the contents, generate about six specific ideas for edits to the current page.
These edits should offer different styles, layouts, or changes to the current page content.
Do a few normal ones, then a few zany ones.
Make each edit distinct and engaging.
<cmd>
All edits must be possible by modifying the current page with simple html/css/javascript.
They must not require a persistent database or backend, external API calls, or invoke external resources (video, images, audio, live data, chat, etc).
They can, however, link to other pages.
Edits should be very short, direct, and to the point - no filler words. Try for 10 words or less.
Write a one sentence analysis describing your thought process, then return the edits as a bracketed array of quoted strings, like this: ["edit", "another edit", "some third edit"].
</cmd>`;

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
