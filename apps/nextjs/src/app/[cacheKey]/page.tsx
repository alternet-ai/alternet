import { auth } from "@acme/auth";

import type { Page } from "../types";
import { env } from "~/env";
import LoginComponent from "../_components/login";
import ParentComponent, { HOME_KEY } from "../ParentComponent";

interface SearchParams {
  profile?: string;
}

export function generateMetadata({ params }: { params: { cacheKey: string } }) {
  const cacheKey = params.cacheKey;

  return {
    metadataBase: new URL(
      env.VERCEL_ENV === "production"
        ? "https://alternet.ai"
        : "http://localhost:3000",
    ),
    title: "alternet",
    description: "dream play create",
    openGraph: {
      title: "alternet",
      description: "dream play create",
      url: "https://alternet.ai",
      siteName: "alternet",
    },
    twitter: {
      card: "summary_large_image",
      site: "@alternet_ai",
      creator: "@maxsloef",
    },
  };
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
