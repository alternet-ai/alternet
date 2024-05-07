import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge";

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;

    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    const filename = "avatars/" + generateUUID();
    const result = await put(filename, imageBuffer, {
      access: "public",
      contentType: fileType, // Use the MIME type from the frontend
    });

    return NextResponse.json({
      url: result.url,
    });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
