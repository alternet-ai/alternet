import { redirect } from "next/navigation";

import type { Page } from "./types";
import { env } from "~/env";
import { HOME_KEY } from "./static/constants";

interface CardImagesResponse {
  image: string;
  pageData: Page;
}

export async function generateMetadata() {
  const url = new URL(env.NEXT_PUBLIC_API_BASE_URL + "/" + HOME_KEY);

  // Fetching card image and page data from the API
  const cardImagesResponse = await fetch(
    `${env.NEXT_PUBLIC_API_BASE_URL}/api/card-images?cacheKey=${HOME_KEY}`,
  );
  const { image: base64Image, pageData } =
    (await cardImagesResponse.json()) as CardImagesResponse;

  const metadata = {
    metadataBase: new URL(env.NEXT_PUBLIC_API_BASE_URL),
    title: `alternet`,
    description: `dream play create`,
    openGraph: {
      title: `${pageData.title}`,
      description: `${pageData.prompt}`,
      url,
      siteName: `${pageData.title}`,
      image: `data:image/png;base64,${base64Image}`, // Embedding the base64 image
    },
    twitter: {
      card: "summary_large_image",
      site: "@alternet_ai",
      creator: "@maxsloef",
      image: `data:image/png;base64,${base64Image}`, // Embedding the base64 image for Twitter card
    },
  };

  return metadata;
}

const HomePage = () => {
  redirect("/home");
};

export default HomePage;
