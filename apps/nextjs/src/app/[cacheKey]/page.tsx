"use client";

import { useEffect, useState } from "react";

import type { Page } from "../types";
import ParentComponent, { HOME_KEY } from "../ParentComponent";

const CacheKeyPage = ({ params }: { params: { cacheKey: string } }) => {
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const { cacheKey } = params;

    // Fetch the page from storage using the cacheKey
    fetch(`/api/load-page?cacheKey=${cacheKey}`)
      .then((response) => response.json())
      .then((fetchedPage: Page) => {
        console.log("fetchedPage", fetchedPage);
        setPage(fetchedPage);
      })
      .catch((error) => {
        console.error("Error fetching page:", error);
      });
  }, [params.cacheKey]);

  if (!page) {
    if (params.cacheKey !== HOME_KEY) {
      console.log("page not found for cache key", params.cacheKey);
    }

    return <ParentComponent />;
  }

  return <ParentComponent initialPage={page} />;
};

export default CacheKeyPage;
