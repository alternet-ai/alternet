"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";

import { Separator } from "@acme/ui/separator";

import type { NavigationState, Page } from "./types";
import BottomBar from "./_components/bottombar";
import IframeContainer from "./_components/container";
import HistoryPanel from "./_components/history";
import FloatingLogo from "./_components/logo";
import TopBar from "./_components/topbar";

const HOMEKEY = "home";

const ParentComponent = () => {
  const cacheWaitingRef = useRef<string>("");
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

  const { append, isLoading, messages, setMessages } = useChat({
    initialMessages: [
      { role: "user", content: homeEntry.prompt, id: "1" },
      {
        role: "assistant",
        content: homeEntry.content,
        id: "2",
      },
    ],
    onFinish: (message) => {
      console.log("done, setting final content");
      setHtml(message.content);
      if (cacheWaitingRef.current) {
        setPageCache((prevCache) => ({
          ...prevCache,
          [cacheWaitingRef.current]: {
            ...(prevCache[cacheWaitingRef.current] ?? ({} as Page)),
            content: message.content,
          },
        }));
      }
    },
  });

  const [showHistory, setShowHistory] = useState(true);

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

    console.log("calling append");
    await append({
      role: "user",
      content: prompt,
    });

    const content = "";
    const fakeUrl = "https://url.fake/" + prompt.replace(" ", "_");

    const title = "title for " + prompt;
    cacheKey = crypto.randomUUID();

    const page: Page = {
      title,
      fakeUrl,
      prompt,
      content,
      cacheKey,
    };

    return page;
  };

  const updateHtmlAndHistory = async (
    cacheKey?: string,
    prompt?: string,
    index?: number,
  ) => {
    setHtml("");
    console.log("set html to empty");
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
    if (page.content) {
      console.log("setting cached page content");
      setHtml(page.content);
    } else {
      cacheWaitingRef.current = page.cacheKey;
    }
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
    setMessages([
      { role: "user", content: homeEntry.prompt, id: "1" },
      {
        role: "assistant",
        content: homeEntry.content,
        id: "2",
      },
    ]);
  };

  const openHistory = () => {
    setShowHistory(!showHistory); // Toggle visibility of the history panel
  };

  useEffect(() => {
    const lastMessage = messages
      .filter((message) => message.role === "assistant")
      .pop();
    if (lastMessage) {
      setHtml(lastMessage.content);
    }
    console.log("No assistant message found");
  }, [messages]);

  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col">
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
        <IframeContainer html={html} isLoading={isLoading} />
        <FloatingLogo src="alternet" isPortrait={isPortrait} />
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
