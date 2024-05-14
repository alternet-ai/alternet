import { auth } from "@acme/auth";

import type { Page } from "../types";
import LoginComponent from "../_components/login";
import ParentComponent from "../_components/ParentComponent";
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

  const openToProfile = searchParams?.profile !== undefined;

  return (
    <ParentComponent
      initialPage={params.cacheKey}
      openToProfile={openToProfile}
    />
  );
};

export default CacheKeyPage;
