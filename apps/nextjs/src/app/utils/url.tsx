import { env } from "~/env";
import { HOME_ID, HOME_PAGE } from "../static/constants";

export const DEPLOYMENT_URL = env.NODE_ENV === 'development' 
    ? 'http://' + env.NEXT_PUBLIC_VERCEL_BRANCH_URL
    : 'https://' + env.NEXT_PUBLIC_VERCEL_BRANCH_URL;

export function genericMetadata() {
    const url = new URL(DEPLOYMENT_URL + "/" + HOME_ID);
  
    const page = HOME_PAGE;
  
    // Check if an image already exists in the bucket
    const imageUrl = `${env.NEXT_PUBLIC_SCREENSHOT_BUCKET_URL}/${HOME_ID}.png`;
  
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