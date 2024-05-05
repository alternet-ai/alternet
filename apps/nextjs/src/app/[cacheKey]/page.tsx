import { auth } from "@acme/auth";

import type { Page } from "../types";
import { env } from "~/env";
import LoginComponent from "../_components/login";
import ParentComponent from "../ParentComponent";
import { HOME_KEY, HOME_PAGE } from "../static/constants";

interface SearchParams {
  profile?: string;
}

export async function generateMetadata({
  params,
}: {
  params: { cacheKey: string };
}) {
  const cacheKey = params.cacheKey;
  const url = new URL(env.NEXT_PUBLIC_API_BASE_URL + "/" + cacheKey);

  let page: Page;
  if (cacheKey === HOME_KEY) {
    page = HOME_PAGE;
  } else {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_BASE_URL}/api/load-page?cacheKey=${cacheKey}`,
    );
    page = (await response.json()) as Page;
  }


  const metadata = {
    metadataBase: new URL(env.NEXT_PUBLIC_API_BASE_URL),
    title: `alternet`,
    description: `dream play create`,
    openGraph: {
      title: `${page.title}`,
      description: `${page.prompt}`,
      url,
      siteName: `${page.title}`,
    },
    twitter: {
      card: "summary_large_image",
      site: "@alternet_ai",
      creator: "@maxsloef",
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
