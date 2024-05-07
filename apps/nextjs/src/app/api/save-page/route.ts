import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import type { Page } from "~/app/types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const page = (await request.json()) as Page;

    if (!page.cacheKey) {
      return NextResponse.json({ error: "Invalid page data" }, { status: 400 });
    }

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
