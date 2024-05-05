import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

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

    const filename = "avatars/" + randomUUID();
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
