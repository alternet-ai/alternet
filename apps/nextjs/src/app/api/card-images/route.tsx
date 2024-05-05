import puppeteer from 'puppeteer';

import type { Page } from "~/app/types";
import { HOME_KEY, HOME_PAGE } from "~/app/static/constants";
import { env } from "~/env";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const hasKey = searchParams.has("cacheKey");
    const cacheKey = hasKey ? searchParams.get("cacheKey") : HOME_KEY;

    let pageData: Page;
    if (cacheKey === HOME_KEY) {
      pageData = HOME_PAGE;
    } else {
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_BASE_URL}/api/load-page?cacheKey=${cacheKey}`,
      );
      pageData = (await response.json()) as Page;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(pageData.content);
    await page.setViewport({ width: 1200, height: 630 });
    const screenshotBuffer = await page.screenshot({ type: 'png' });
    await browser.close();

    const responseBody = {
      image: screenshotBuffer.toString('base64'),
      pageData
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log(`${e.message}`);
    } else {
      console.log('An unexpected error occurred', e);
    }
    return new Response(`Failed to generate the image and retrieve page data`, {
      status: 500,
    });
  }
}
