"use client";

import type { CSSProperties } from "react";
import React, { useEffect, useState } from "react";

import { Separator } from "@acme/ui/separator";

import type { NavigationState, Page } from "./types";
import BottomBar from "./_components/bottombar";
import IframeContainer from "./_components/container";
import HistoryPanel from "./_components/history";
import FloatingLogo from "./_components/logo";
import TopBar from "./_components/topbar";

const HOMEKEY = "home";

const ParentComponent = () => {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < window.innerHeight;
    }
    return false;
  });

  const homeEntry: Page = {
    title: "Home",
    prompt: "https://alternet.ai/home",
    fakeUrl: "https://alternet.ai/home",
    content: "<html><body><h1>Welcome Home</h1></body></html>",
    cacheKey: HOMEKEY,
  };
  const [pageCache, setPageCache] = useState<Record<string, Page>>({
    [HOMEKEY]: homeEntry,
  });

  //const [siteMap, setSiteMap] = useState<Record<string, string>>({});

  const [navState, setNavState] = useState<NavigationState>({
    currentIndex: 0,
    history: [HOMEKEY],
    bookmarks: [],
  });

  const [html, setHtml] = useState(() => {
    const content = pageCache[HOMEKEY]?.content;
    if (content === undefined) {
      throw new Error("The cache is empty during init??? how");
    }

    return content;
  });

  const [currentUrl, setCurrentUrl] = useState(() => {
    const cacheKey = navState.history[navState.currentIndex] ?? "";
    const page = pageCache[cacheKey];
    const fakeUrl = page?.fakeUrl;
    if (!fakeUrl) {
      throw new Error("Fake url is undefined");
    }
    return fakeUrl;
  });

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsPortrait(window.innerWidth < window.innerHeight);
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }
  }, []);

  const getPage = async (prompt?: string, cacheKey?: string): Promise<Page> => {
    if (cacheKey && pageCache[cacheKey]) {
      const cachedPage = pageCache[cacheKey];

      if (cachedPage) {
        return cachedPage;
      }
    } else if (cacheKey) {
      throw new Error("Cache key is not valid");
    }

    if (!prompt) {
      throw new Error("prompt is required");
    }

    const response = await fetch(`https://httpbin.org/get`);
    const content = await response.text();
    const fakeUrl = "https://url.fake/" + prompt.replace(" ", "_");

    const title = "title for " + prompt;
    cacheKey = crypto.randomUUID();

    const page = {
      title,
      fakeUrl,
      prompt,
      content,
      cacheKey,
    };

    setPageCache({
      ...pageCache,
      [cacheKey]: page,
    });

    return page;
  };

  const updateHtmlAndHistory = async (
    cacheKey?: string,
    prompt?: string,
    index?: number,
  ) => {
    const page = await getPage(prompt, cacheKey);

    setNavState({
      ...navState,
      currentIndex: index ?? navState.currentIndex + 1,
      history:
        index !== undefined
          ? navState.history
          : [...navState.history, page.cacheKey],
    });

    setCurrentUrl(page.fakeUrl);
    setHtml(page.content);
  };

  const navigateTo = async (prompt?: string) => {
    await updateHtmlAndHistory(undefined, prompt);
  };

  const goBack = async () => {
    if (navState.currentIndex > 0) {
      const newIndex = navState.currentIndex - 1;
      const cacheKey = navState.history[newIndex];
      await updateHtmlAndHistory(cacheKey, undefined, newIndex);
    }
  };

  const handleSelectHistoryItem = async (index: number) => {
    const cacheKey = navState.history[index];
    if (!cacheKey) {
      throw new Error(
        "Somehow the cache key is undefined when selecting from history",
      );
    }

    await updateHtmlAndHistory(cacheKey, undefined, index);
  };

  const goForward = async () => {
    if (navState.currentIndex < navState.history.length - 1) {
      const newIndex = navState.currentIndex + 1;
      const cacheKey = navState.history[newIndex];
      await updateHtmlAndHistory(cacheKey, undefined, newIndex);
    }
  };

  const refresh = async () => {
    const cacheKey = navState.history[navState.currentIndex] ?? "";
    const page = pageCache[cacheKey];
    const prompt = page?.prompt;
    if (prompt !== undefined) {
      await navigateTo(prompt);
    } else {
      throw new Error("Current page prompt undefined while refreshing");
    }
  };

  const addBookmark = () => {
    const cacheKey = navState.history[navState.currentIndex];
    if (cacheKey !== undefined && !navState.bookmarks.includes(cacheKey)) {
      setNavState({
        ...navState,
        bookmarks: [...navState.bookmarks, cacheKey],
      });
      // Optionally, save bookmarks to a backend or local storage
    }
  };

  const goHome = () => {
    setPageCache({
      [HOMEKEY]: homeEntry,
    });
    setNavState({
      ...navState,
      history: [HOMEKEY],
      currentIndex: 0,
    });

    const content = pageCache[HOMEKEY]?.content;
    const fakeUrl = pageCache[HOMEKEY]?.fakeUrl;
    if (content === undefined || fakeUrl === undefined) {
      throw new Error("The cache is empty during goHome??? how");
    }

    setCurrentUrl(fakeUrl);
    setHtml(content);
  };

  const openHistory = () => {
    setShowHistory(!showHistory); // Toggle visibility of the history panel
  };

  const logoToggleStyle: CSSProperties = {
    position: "absolute",
    bottom: isPortrait ? "4rem" : "0.5rem",
    right: "1rem",
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          isPortrait={isPortrait}
          currentUrl={currentUrl}
          onAddressEntered={navigateTo}
          onBack={goBack}
          onForward={goForward}
          onRefresh={refresh}
          onBookmark={addBookmark}
          onGoHome={goHome}
          onOpenHistory={openHistory}
        />
        <IframeContainer html={html} />
        <div style={logoToggleStyle}>
          <FloatingLogo src="alternet" />
        </div>
        {isPortrait && (
          <BottomBar
            onBack={goBack}
            onForward={goForward}
            onRefresh={refresh}
            onBookmark={addBookmark}
            onGoHome={goHome}
            onOpenHistory={openHistory}
          />
        )}
      </div>
      {showHistory && (
        <>
          <Separator orientation="vertical" className="h-full" />
          <HistoryPanel
            history={
              navState.history
                .map((cacheKey) => pageCache[cacheKey])
                .filter((page) => page !== undefined) as Page[]
            }
            onSelect={handleSelectHistoryItem}
            setOpen={setShowHistory}
          />
        </>
      )}
    </div>
  );
};

export default ParentComponent;
