import { auth } from "@acme/auth";

import type { Page } from "../types";
import { env } from "~/env";
import LoginComponent from "../_components/login";
import ParentComponent from "../ParentComponent";
import { HOME_KEY, HOME_PAGE } from "../static/constants";

interface SearchParams {
  profile?: string;
}

interface CardImagesResponse {
  image: string;
  pageData: Page;
}

export async function generateMetadata({
  params,
}: {
  params: { cacheKey: string };
}) {
  const cacheKey = params.cacheKey;
  const url = new URL(env.NEXT_PUBLIC_API_BASE_URL + "/" + cacheKey);

  // Fetching card image and page data from the API
  const cardImagesResponse = await fetch(
    `${env.NEXT_PUBLIC_API_BASE_URL}/api/card-images?cacheKey=${cacheKey}`,
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

const CacheKeyPage = async ({
  params,
  searchParams,
}: {
  params: { cacheKey: string };
  searchParams?: SearchParams;
}) => {
  const session = await auth();

  if (!session) {
    return <LoginComponent />;
  }

  let page: Page | null = null;
  try {
    const { cacheKey } = params;
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_BASE_URL}/api/load-page?cacheKey=${cacheKey}`,
    );
    page = (await response.json()) as Page;
  } catch (error) {
    console.error("Error fetching page:", error);
  }

  if (!page) {
    if (params.cacheKey !== HOME_KEY) {
      console.log("page not found for cache key", params.cacheKey);
    }
    return <ParentComponent />;
  }

  // Check if 'profile' query parameter is present and pass it as a prop
  const profileProp =
    searchParams?.profile !== undefined ? { profile: true } : {};

  return <ParentComponent initialPage={page} {...profileProp} />;
};

export default CacheKeyPage;
