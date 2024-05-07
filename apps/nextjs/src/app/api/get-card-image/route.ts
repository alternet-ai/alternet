import type { Page } from "~/app/types";
import { DEPLOYMENT_URL } from "~/app/utils/url";
import { env } from "~/env";

export const runtime = "edge";

export async function POST(req: Request) {
  const { cacheKey } = (await req.json()) as { cacheKey: string };
  if (!cacheKey) {
    return new Response(JSON.stringify({ imageUrl: null }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  // Check if an image already exists in the bucket
  const existingImageUrl = `${env.NEXT_PUBLIC_SCREENSHOT_BUCKET_URL}/${cacheKey}.png`;
  const imageExistsResponse = await fetch(existingImageUrl, { method: "HEAD" });
  let imageUrl;

  if (imageExistsResponse.ok) {
    imageUrl = existingImageUrl;
  } else {
    const response = await fetch(
      `${DEPLOYMENT_URL}/api/load-page?cacheKey=${cacheKey}`,
    );
    const page = (await response.json()) as Page;

    // Fetching card image and page data from the API if not exists
    const cardImagesResponse = await fetch(
      `${env.SCREENSHOT_API_BASE_URL}/screenshot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: env.SCREENSHOT_API_KEY,
          html: page.content,
          cacheKey: cacheKey,
        }),
      },
    );

    const imageData = (await cardImagesResponse.json()) as { imageUrl: string };
    imageUrl = imageData.imageUrl;
  }

  return new Response(JSON.stringify({ imageUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
