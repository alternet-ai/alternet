import type { Page } from "../types";
import { HOME_HTML } from "./home-html";

export const HOME_KEY = "home";
export const HOME_PAGE: Page = {
  title: "alternet: home",
  prompt: "https://alternet.ai/home",
  fakeUrl: "https://alternet.ai/home",
  content: HOME_HTML,
  cacheKey: HOME_KEY,
  userId: "",
};