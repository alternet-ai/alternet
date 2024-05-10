import { redirect } from "next/navigation";

import { env } from "~/env";
import { HOME_KEY, HOME_PAGE } from "./static/constants";
import { DEPLOYMENT_URL } from "./utils/url";

export function generateMetadata() {
  const url = new URL(DEPLOYMENT_URL + "/" + HOME_KEY);

  const page = HOME_PAGE;

  // Check if an image already exists in the bucket
  const imageUrl = `${env.NEXT_PUBLIC_SCREENSHOT_BUCKET_URL}/${HOME_KEY}.png`;

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

const HomePage = () => {
  redirect("/home");
};

export default HomePage;
