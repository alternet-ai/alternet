import { auth } from "@acme/auth";

import type { Page } from "../types";
import { api } from "~/trpc/server";
import ParentComponent from "../_components/ParentComponent";
import { HOME_ID, HOME_PAGE } from "../static/constants";
import { DEPLOYMENT_URL } from "../utils/url";

interface SearchParams {
  profile?: string;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  let id = params.id;
  if (!id) {
    id = HOME_ID;
  }
  const url = new URL(DEPLOYMENT_URL + "/" + id);

  let page: Page;
  if (id === HOME_ID) {
    page = HOME_PAGE;
  } else {
      const newPage = await api.page.load(id);
      if (!newPage) {
        throw new Error("Page not found");
    }
    page = newPage;
  }

  const response = await fetch(`${DEPLOYMENT_URL}/api/get-card-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
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

const idPage = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: SearchParams;
}) => {
  const session = await auth();

  if (session) {
    await api.pageView.view(params.id);
  }

  const openToProfile = searchParams?.profile !== undefined;
  return (
    <ParentComponent initialPage={params.id} openToProfile={openToProfile} />
  );
};

export default idPage;
