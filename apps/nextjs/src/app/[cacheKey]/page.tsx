import { auth, signIn } from "@acme/auth";
import { Button } from "@acme/ui/button";
import type { Page } from "../types";
import ParentComponent, { HOME_KEY } from "../ParentComponent";
import { env } from "~/env";

const CacheKeyPage = async ({ params }: { params: { cacheKey: string } }) => {
  const session = await auth();

  if (!session) {
    return (
      <div>
        <p>You need to be logged in to view this page.</p>
        <form>
          <Button
            size="lg"
            formAction={async () => {
              "use server";
              await signIn("discord");
            }}
          >
            Sign in with Discord
          </Button>
        </form>
      </div>
    );
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