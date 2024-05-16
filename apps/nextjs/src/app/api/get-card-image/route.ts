import { env } from "~/env";
import { api } from "~/trpc/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const { id } = (await req.json()) as { id: string };
  if (!id) {
    return new Response(JSON.stringify({ imageUrl: null }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  // Check if an image already exists in the bucket
  const existingImageUrl = `${env.NEXT_PUBLIC_SCREENSHOT_BUCKET_URL}/${id}.png`;
  const imageExistsResponse = await fetch(existingImageUrl, { method: "HEAD" });
  let imageUrl;

  if (imageExistsResponse.ok) {
    imageUrl = existingImageUrl;
  } else {
    try {
      const page = await api.page.load(id);
      if (!page) {
        throw new Error("Page not found");
      }

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
            cacheKey: id,
          }),
        },
      );

      if (!cardImagesResponse.ok) {
        throw new Error(
          `Error fetching card image: ${cardImagesResponse.statusText}`,
        );
      }

      const imageData = (await cardImagesResponse.json()) as {
        imageUrl: string;
      };
      imageUrl = imageData.imageUrl;
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ imageUrl: null }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  return new Response(JSON.stringify({ imageUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
