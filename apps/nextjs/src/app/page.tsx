"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message } from "ai";
import { useChat } from "ai/react";

import { Separator } from "@acme/ui/separator";

import type { NavigationState, Page } from "./types";
import BottomBar from "./_components/bottombar";
import IframeContainer from "./_components/container";
import HistoryPanel from "./_components/history";
import FloatingLogo from "./_components/logo";
import TopBar from "./_components/topbar";

const HOME_KEY = "home";
const HOME_ENTRY: Page = {
  title: "home",
  prompt: "https://alternet.ai/home",
  fakeUrl: "https://alternet.ai/home",
  content: `<title>home</title><html><body><h1>Welcome Home</h1><link rel="canonical" href="https://alternet.ai/home"></body></html>`,
  cacheKey: HOME_KEY,
};

const ParentComponent = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [pageCache, setPageCache] = useState<Record<string, Page>>({
    [HOME_KEY]: HOME_ENTRY,
  });

  //const [siteMap, setSiteMap] = useState<Record<string, string>>({});

  const [navState, setNavState] = useState<NavigationState>({
    currentIndex: 0,
    history: [HOME_KEY],
  });

  const [html, setHtml] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [title, setTitle] = useState("");

  const { append, isLoading, messages, setMessages } = useChat({
    initialMessages: [
      { role: "user", content: HOME_ENTRY.prompt, id: "1" },
      {
        role: "assistant",
        content: HOME_ENTRY.content,
        id: "2",
      },
    ],

    onFinish: (message) => {
      updateCurrentPage(message, true);
      console.log(navState);
      console.log(pageCache);
    },

    onError: (error) => {
      throw error;
    },
  });

  const [showHistory, setShowHistory] = useState(true); //todo: false?

  //initial state
  useEffect(() => {
    getCachedPage(HOME_KEY, 0);

    const handleResize = () => {
      setIsPortrait(window.innerWidth < window.innerHeight);
    };

    // Set the initial value once the component has mounted
    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const getCachedPage = (cacheKey: string, index: number) => {
    const cachedPage = pageCache[cacheKey];

    if (cachedPage) {
      setHtml(cachedPage.content);
      setCurrentUrl(cachedPage.fakeUrl);
      setTitle(cachedPage.title);
    } else {
      throw new Error("Cache key is not valid");
    }

    setNavState({
      ...navState,
      currentIndex: index,
    });
  };

  const generatePage = (prompt: string) => {
    setHtml("");

    void append({
      role: "user",
      content: prompt,
    });

    const page: Page = {
      title: "Loading...",
      fakeUrl: "Loading...",
      prompt,
      content: "",
      cacheKey: crypto.randomUUID(),
    };

    setPageCache({
      ...pageCache,
      [page.cacheKey]: page,
    });

    setNavState({
      currentIndex: navState.currentIndex + 1,
      history: [...navState.history, page.cacheKey],
    });
  };

  const goToNewPage = (prompt: string) => {
    generatePage(prompt);
  };

  const goBack = () => {
    if (navState.currentIndex > 0) {
      const newIndex = navState.currentIndex - 1;
      const cacheKey = navState.history[newIndex];
      if (!cacheKey) {
        throw new Error("Somehow the cache key is undefined when going back");
      }
      getCachedPage(cacheKey, newIndex);
    }
  };

  const handleSelectHistoryItem = (index: number) => {
    const cacheKey = navState.history[index];
    if (!cacheKey) {
      throw new Error(
        "Somehow the cache key is undefined when selecting from history",
      );
    }

    getCachedPage(cacheKey, index);
  };

  const goForward = () => {
    if (navState.currentIndex < navState.history.length - 1) {
      const newIndex = navState.currentIndex + 1;
      const cacheKey = navState.history[newIndex];
      if (!cacheKey) {
        throw new Error(
          "Somehow the cache key is undefined when going forward",
        );
      }
      getCachedPage(cacheKey, newIndex);
    }
  };

  const refresh = () => {
    const cacheKey = navState.history[navState.currentIndex] ?? "";
    const page = pageCache[cacheKey];
    const prompt = page?.prompt;
    if (prompt !== undefined) {
      goToNewPage(prompt);
    } else {
      throw new Error("Current page prompt undefined while refreshing");
    }
  };

  const addBookmark = () => {
    // const cacheKey = navState.history[navState.currentIndex];
    // if (cacheKey !== undefined && !navState.bookmarks.includes(cacheKey)) {
    //   setNavState({
    //     ...navState,
    //     bookmarks: [...navState.bookmarks, cacheKey],
    //   });
    //   // Optionally, save bookmarks to a backend or local storage
    // }
  };

  const goHome = () => {
    setPageCache({
      [HOME_KEY]: HOME_ENTRY,
    });
    setNavState({
      history: [HOME_KEY],
      currentIndex: 0,
    });

    setMessages([
      { role: "user", content: HOME_ENTRY.prompt, id: "1" },
      {
        role: "assistant",
        content: HOME_ENTRY.content,
        id: "2",
      },
    ]);
  };

  const openHistory = () => {
    setShowHistory(!showHistory); // Toggle visibility of the history panel
  };

  const updateCurrentPage = (message: Message, updateCache?: boolean) => {
    setHtml(message.content);
    const title =
      "alternet: " + message.content.match(/<title>([^<]+)<\/title>/)?.[1] ??
      "Loading...";
    setTitle(title);
    const url =
      message.content.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ??
      "Loading...";
    setCurrentUrl(url);

    if (updateCache) {
      const cacheKey = navState.history[navState.currentIndex];
      if (!cacheKey) {
        console.log("cache key", cacheKey);
        console.log("navState", navState);
        throw new Error(
          "Cache key is not valid when writing new message: " + cacheKey,
        );
      }

      setPageCache((prevCache) => ({
        ...prevCache,
        [cacheKey]: {
          ...(prevCache[cacheKey] ?? ({} as Page)),
          content: message.content,
          fakeUrl: url,
          title: title,
        },
      }));
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    const lastMessage = messages
      .filter((message) => message.role === "assistant")
      .pop();
    if (lastMessage) {
      updateCurrentPage(lastMessage);
    }
  }, [messages]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col">
        <TopBar
          isPortrait={isPortrait}
          currentUrl={currentUrl}
          onAddressEntered={goToNewPage}
          onBack={goBack}
          onForward={goForward}
          onRefresh={refresh}
          onBookmark={addBookmark}
          onGoHome={goHome}
          onOpenHistory={openHistory}
        />
        <IframeContainer
          html={html}
          isLoading={isLoading}
          setTitle={() => {}}
        />
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
