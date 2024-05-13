import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import type { Page } from "~/app/types";
import { api } from "~/trpc/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const page = (await request.json()) as Page;

    if (!page.cacheKey) {
      return NextResponse.json({ error: "Invalid page data" }, { status: 400 });
    }

    if (!page.parentId) {
      console.error("page.parentId is missing for page", page.cacheKey);
    }

    if (!page.response) {
      console.error("page.response is missing for page", page.cacheKey);
    }

    //save to db
    await api.page.add({
      title: page.title,
      fakeUrl: page.fakeUrl,
      prompt: page.prompt,
      content: page.content,
      id: page.cacheKey,
      response: page.response ?? "",
      parentId: page.parentId ?? "",
    });

    const pageBlob = Buffer.from(JSON.stringify(page));

    await put(page.cacheKey, pageBlob, {
      access: "public",
    });
    return NextResponse.json({ message: "Page saved successfully" });
  } catch (error) {
    console.error("Error saving page:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
