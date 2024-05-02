"use client";

import React, { useState } from "react";

import { Separator } from "@acme/ui/separator";

import type { NavigationState, Page } from "./types";
import IframeContainer from "./_components/container";
import HistoryPanel from "./_components/history";
import FloatingLogo from "./_components/logo";
import TopBar from "./_components/topbar";

const HOMEKEY = "home";

const ParentComponent = () => {
  const homeEntry: Page = {
    title: "Home",
    prompt: "home",
    fakeUrl: "https://alternet.ai/home",
    content: "<html><body><h1>Welcome Home</h1></body></html>",
  };
  const [pageCache, setPageCache] = useState<Record<string, Page>>({
    [HOMEKEY]: homeEntry,
  });

  const [navState, setNavState] = useState<NavigationState>({
    currentIndex: 0,
    history: [HOMEKEY],
    bookmarks: [],
  });

  const [html, setHtml] = useState(() => {
    const content = pageCache[homeEntry.fakeUrl]?.content;
    if (content === undefined) {
      throw new Error("Content is undefined.");
    }

    return content;
  });

  const [showHistory, setShowHistory] = useState(false);

  const getPage = async (prompt?: string, cacheKey?: string): Promise<Page> => {
    if (cacheKey && pageCache[cacheKey]) {
      const cachedPage = pageCache[cacheKey];

      if (cachedPage) {
        return cachedPage;
      }
    }

    if (!prompt) {
      throw new Error("prompt is required");
    }

    const response = await fetch(`https://httpbin.org/get`);
    const content = await response.text();
    const fakeUrl = "https://url.fake/" + prompt.replace(" ", "_");

    const title = "title for " + prompt;

    const newPage = {
      title,
      fakeUrl,
      prompt,
      content,
    };

    return newPage;
  };

  const updateHtmlAndHistory = async (
    index: number,
    cacheKey?: string,
    prompt?: string,
    history?: string[],
  ) => {
    const newHistory = history ?? navState.history;
    const page = await getPage(prompt, cacheKey);
    if (!cacheKey) {
      cacheKey = crypto.randomUUID();
      setPageCache({
        ...pageCache,
        [cacheKey]: page,
      });

      newHistory.push(cacheKey);
    }

    setNavState({
      ...navState,
      currentIndex: index,
      history: newHistory,
    });

    setHtml(page.content);
  };

  const navigateTo = async (prompt?: string) => {
    const newHistory = [...navState.history];
    //slice off the rest of the history if we're not at the end
    if (navState.currentIndex + 1 < newHistory.length) {
      newHistory.splice(navState.currentIndex + 1);
    }

    await updateHtmlAndHistory(
      newHistory.length - 1,
      undefined,
      prompt,
      newHistory,
    );
  };

  const goBack = async () => {
    if (navState.currentIndex > 0) {
      const newIndex = navState.currentIndex - 1;

      await updateHtmlAndHistory(newIndex);
    }
  };

  const goForward = async () => {
    if (navState.currentIndex < navState.history.length - 1) {
      const newIndex = navState.currentIndex + 1;
      const prompt = navState.history[newIndex]?.prompt;
      if (!prompt) return;

      await updateHtmlAndHistory(prompt, newIndex);
    }
  };

  const refresh = async () => {
    const currentPage = navState.history[navState.currentIndex];
    if (currentPage !== undefined) {
      await navigateTo(currentPage.prompt, true);
    }
  };

  const addBookmark = () => {
    const currentPage = navState.history[navState.currentIndex];
    if (
      currentPage !== undefined &&
      !navState.bookmarks.includes(currentPage.prompt)
    ) {
      setNavState({
        ...navState,
        bookmarks: [...navState.bookmarks, currentPage.prompt],
      });
      // Optionally, save bookmarks to a backend or local storage
    }
  };

  const goHome = async () => {
    const newHistory = [homeEntry];
    setPageCache({
      home: [homeEntry],
    });
    await updateHtmlAndHistory(homeEntry.prompt, 0, newHistory);
  };

  const openHistory = () => {
    setShowHistory(!showHistory); // Toggle visibility of the history panel
  };

  const handleSelectHistoryItem = async (index: number) => {
    const prompt = navState.history[index]?.prompt;
    if (!prompt) return;

    await updateHtmlAndHistory(prompt, index);
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col">
        <TopBar
          onAddressEntered={navigateTo}
          onBack={goBack}
          onForward={goForward}
          onRefresh={refresh}
          onBookmark={addBookmark}
          onGoHome={goHome}
          onOpenHistory={openHistory}
        />
        <IframeContainer html={html} />
        <FloatingLogo src="alternet" />
      </div>
      {showHistory && (
        <>
          <Separator orientation="vertical" className="h-full" />
          <HistoryPanel
            history={navState.history}
            onSelect={handleSelectHistoryItem}
            setOpen={setShowHistory}
          />
        </>
      )}
    </div>
  );
};

export default ParentComponent;
