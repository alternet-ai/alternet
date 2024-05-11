import type { Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "next-auth/react";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";
import { HOME_KEY, HOME_PAGE } from "./static/constants";
import { DEPLOYMENT_URL } from "./utils/url";

export function generateMetadata() {
  const url = new URL(DEPLOYMENT_URL + "/" + HOME_KEY);

  const page = HOME_PAGE;

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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  maximumScale: 1,
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-svh bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCReactProvider>{props.children}</TRPCReactProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
