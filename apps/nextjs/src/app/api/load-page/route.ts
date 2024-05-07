import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

import type { Page } from "~/app/types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cacheKey = searchParams.get("cacheKey");

  if (!cacheKey) {
    return NextResponse.json({ error: "Missing cacheKey" }, { status: 400 });
  }

  try {
    // Use the prefix option to filter blobs by cacheKey
    const response = await list({ prefix: cacheKey });
    const pageBlob = response.blobs.find((blob) => blob.pathname === cacheKey);

    if (!pageBlob) {
      console.error("Page not found:", cacheKey);
      return NextResponse.json(null, { status: 404 });
    }

    // Fetch the content of the blob using the downloadUrl
    const pageResponse = await fetch(pageBlob.downloadUrl);
    const page = (await pageResponse.json()) as Page;

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error loading page:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
