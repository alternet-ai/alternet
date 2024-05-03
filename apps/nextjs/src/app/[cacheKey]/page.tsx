import { cache } from "react";
import { env } from "~/env";

import type { Page } from "../types";
import ParentComponent, { HOME_KEY } from "../ParentComponent";

const loadPage = cache(async (cacheKey: string) => {
  try {
    const url = new URL(`/api/load-page?cacheKey=${cacheKey}`, env.NEXT_PUBLIC_API_BASE_URL).toString();
    const response = await fetch(url);
    const fetchedPage = await response.json() as Page;
    return fetchedPage;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
});


const CacheKeyPage = async ({ params }: { params: { cacheKey: string } }) => {
  const page = await loadPage(params.cacheKey);

  if (!page) {
    if (params.cacheKey !== HOME_KEY) {
      console.log("page not found for cache key", params.cacheKey);
    }

    return <ParentComponent />;
  }

  return <ParentComponent initialPage={page} />;
};

export default CacheKeyPage;