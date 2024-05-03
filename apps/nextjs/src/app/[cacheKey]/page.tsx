import { auth, signIn } from "@acme/auth";
import { Button } from "@acme/ui/button";
import type { Page } from "../types";
import ParentComponent, { HOME_KEY } from "../ParentComponent";
import { env } from "~/env";
import { HOME_HTML } from "../static/home-html";
import LoginComponent from "../_components/login";

const CacheKeyPage = async ({ params }: { params: { cacheKey: string } }) => {
  const session = await auth();

  if (!session) {
    return <LoginComponent />;
  }

  let page: Page | null = null;
  try {
    const { cacheKey } = params;
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/load-page?cacheKey=${cacheKey}`);
    page = await response.json();
  } catch (error) {
    console.error("Error fetching page:", error);
  }

  if (!page) {
    if (params.cacheKey !== HOME_KEY) {
      console.log("page not found for cache key", params.cacheKey);
    }
    return <ParentComponent />;
  }

  return <ParentComponent initialPage={page} />;
};

export default CacheKeyPage;