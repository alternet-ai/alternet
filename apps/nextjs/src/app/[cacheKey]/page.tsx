import { auth } from "@acme/auth";
import type { Page } from "../types";
import ParentComponent, { HOME_KEY } from "../ParentComponent";
import { env } from "~/env";
import LoginComponent from "../_components/login";

interface SearchParams {
  profile?: string;
}

const CacheKeyPage = async ({ params, searchParams }: { params: { cacheKey: string }, searchParams?: SearchParams }) => {
  const session = await auth();

  if (!session) {
    return <LoginComponent />;
  }

  let page: Page | null = null;
  try {
    const { cacheKey } = params;
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/load-page?cacheKey=${cacheKey}`);
    page = await response.json() as Page;
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
  const profileProp = searchParams?.profile !== undefined ? { profile: true } : {};

  return <ParentComponent initialPage={page} {...profileProp} />;
};

export default CacheKeyPage;