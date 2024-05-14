import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";
import { SessionProvider } from "next-auth/react"

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { env } from "~/env";
import { AppProvider } from "./AppContext";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://alternet.ai"
      : "http://localhost:3000",
  ),
  title: "alternet",
  description: "dream play create",
  openGraph: {
    title: "alternet",
    description: "dream play create",
    url: "https://alternet.ai",
    siteName: "alternet",
  },
  twitter: {
    card: "summary_large_image",
    site: "@alternet_ai",
    creator: "@maxsloef",
  },
};

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
        <AppProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>{props.children}</TRPCReactProvider>
          <Toaster />
          </ThemeProvider>
        </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
