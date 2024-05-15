import type { Page } from "../types";
import { HOME_HTML } from "./home-html";

export const HOME_ID = "home";
export const HOME_PAGE: Page = {
  title: "alternet: home",
  prompt: "https://alternet.ai/home",
  fakeUrl: "https://alternet.ai/home",
  content: HOME_HTML,
  id: HOME_ID,
  userId: "6a6560c2-c604-49a3-a4a8-b80f1e17e504",
  parentId: "none; this is home!",
  response: HOME_HTML,
};

export const BLANK_PAGE: Page = {
  title: "Loading...",
  prompt: "",
  fakeUrl: "Loading...",
  content: "",
  id: "blank",
  userId: "",
  parentId: "",
  response: "",
};

