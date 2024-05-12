import { auth } from "@acme/auth";

import type { Page } from "../types";
import LoginComponent from "../_components/login";
import ParentComponent from "../ParentComponent";
import { HOME_KEY, HOME_PAGE } from "../static/constants";
import { DEPLOYMENT_URL } from "../utils/url";

interface SearchParams {
  profile?: string;
}

export async function generateMetadata({
  params,
}: {
  params: { cacheKey: string };
}) {
  let cacheKey = params.cacheKey;
  if (!cacheKey) {
    cacheKey = HOME_KEY;
  }
  const url = new URL(DEPLOYMENT_URL + "/" + cacheKey);

  let page;
  if (cacheKey === HOME_KEY) {
    page = HOME_PAGE;
  } else {
    try {
      const response = await fetch(
        `${DEPLOYMENT_URL}/api/load-page?cacheKey=${cacheKey}`,
      );
      page = (await response.json()) as Page;
    } catch (error) {
      console.error("Error fetching page for metadata:", error);
    }
  }

  if (!page?.content) {
    //page not ready yet
    return {};
  }

  const response = await fetch(`${DEPLOYMENT_URL}/api/get-card-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cacheKey }),
  });

  const { imageUrl } = (await response.json()) as { imageUrl: string };

  const metadata = {
    metadataBase: new URL(DEPLOYMENT_URL),
    title: `alternet`,
    description: `dream play create`,
    openGraph: {
      title: `${page.title}`,
      description: `${page.prompt}`,
      url,
      siteName: `${page.title}`,
      images: [{ url: `${imageUrl}`, width: 630, height: 1200 }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@alternet_ai",
      creator: "@maxsloef",
      images: [`${imageUrl}`],
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
    const urlString = `${DEPLOYMENT_URL}/api/load-page?cacheKey=${cacheKey}`;
    console.log("fetching page from", urlString);
    const response = await fetch(urlString);
    page = (await response.json()) as Page;
  } catch (error) {
    console.error("Error fetching page to serve:", error);
  }

  if (!page) {
    if (params.cacheKey !== HOME_KEY) {
      console.log("page not found for cache key", params.cacheKey);
    }
    return <ParentComponent />;
  }

  // Check if 'profile' query parameter is present and pass it as a prop
  const profileProp =
    searchParams?.profile !== undefined ? { openToProfile: true } : {};

  return <ParentComponent initialPage={page} {...profileProp} />;
};

export default CacheKeyPage;
