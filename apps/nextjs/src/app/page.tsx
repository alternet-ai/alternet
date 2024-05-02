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

const HOME_KEY = "home";
const HOME_ENTRY: Page = {
  title: "home",
  prompt: "https://alternet.ai/home",
  fakeUrl: "https://alternet.ai/home",
  content: "<html><body><h1>Welcome Home</h1></body></html>",
  cacheKey: HOME_KEY,
};

const ParentComponent = () => {
  const cacheWaitingRef = useRef<string>("");
  const [isPortrait, setIsPortrait] = useState(false);
  const [pageCache, setPageCache] = useState<Record<string, Page>>({
    [HOME_KEY]: HOME_ENTRY,
  });

  //const [siteMap, setSiteMap] = useState<Record<string, string>>({});

  const [navState, setNavState] = useState<NavigationState>({
    currentIndex: -1,
    history: [],
  });

  const [html, setHtml] = useState("");

  const [currentUrl, setCurrentUrl] = useState("");

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

    onError: (error) => {
      throw error;
    },
  });

  const [showHistory, setShowHistory] = useState(true); //todo: false?

  //initial state
  useEffect(() => {
    navigateTo(HOME_KEY);

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

  const getCachedPage = (cacheKey: string): Page => {
    const cachedPage = pageCache[cacheKey];

    if (cachedPage) {
      return cachedPage;
    } else {
      throw new Error("Cache key is not valid");
    }
  };

  const generatePage = (prompt: string): Page => {
    append({
      role: "user",
      content: prompt,
    });

    const content = "";
    const fakeUrl = "";

    const title = "";
    const cacheKey = crypto.randomUUID();

    const page: Page = {
      title,
      fakeUrl,
      prompt,
      content,
      cacheKey,
    };

    setPageCache({
      ...pageCache,
      [page.cacheKey]: page,
    });

    return page;
  };

  const navigateTo = async (
    cacheKey?: string,
    prompt?: string,
    index?: number,
  ) => {
    setHtml("");
    let page: Page;
    if (cacheKey) {
      page = getCachedPage(cacheKey);
      setHtml(page.content);
    } else if (prompt) {
      page = generatePage(prompt);
      cacheWaitingRef.current = page.cacheKey;
    } else {
      throw new Error("prompt or cacheKey is required");
    }

    setNavState({
      ...navState,
      currentIndex: index ?? navState.currentIndex + 1,
      history:
        index !== undefined
          ? navState.history
          : [...navState.history, page.cacheKey],
    });
  };

  const goToNewPage = async (prompt?: string) => {
    await navigateTo(undefined, prompt);
  };

  const goBack = async () => {
    if (navState.currentIndex > 0) {
      const newIndex = navState.currentIndex - 1;
      const cacheKey = navState.history[newIndex];
      await navigateTo(cacheKey, undefined, newIndex);
    }
  };

  const handleSelectHistoryItem = async (index: number) => {
    const cacheKey = navState.history[index];
    if (!cacheKey) {
      throw new Error(
        "Somehow the cache key is undefined when selecting from history",
      );
    }

    await navigateTo(cacheKey, undefined, index);
  };

  const goForward = async () => {
    if (navState.currentIndex < navState.history.length - 1) {
      const newIndex = navState.currentIndex + 1;
      const cacheKey = navState.history[newIndex];
      await navigateTo(cacheKey, undefined, newIndex);
    }
  };

  const refresh = async () => {
    const cacheKey = navState.history[navState.currentIndex] ?? "";
    const page = pageCache[cacheKey];
    const prompt = page?.prompt;
    if (prompt !== undefined) {
      await goToNewPage(prompt);
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
      ...navState,
      history: [HOME_KEY],
      currentIndex: 0,
    });

    const content = pageCache[HOME_KEY]?.content;
    const fakeUrl = pageCache[HOME_KEY]?.fakeUrl;
    if (content === undefined || fakeUrl === undefined) {
      throw new Error("The cache is empty during goHome??? how");
    }

    setCurrentUrl(fakeUrl);
    setHtml(content);
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

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    const lastMessage = messages
      .filter((message) => message.role === "assistant")
      .pop();
    if (lastMessage) {
      setHtml(lastMessage.content);
    }
  }, [messages]);

  const setTitle = (title: string) => {
    const page = pageCache[cacheWaitingRef.current];
    if (!page) {
      throw new Error("Page not found while setting title");
    }
    setPageCache({
      ...pageCache,
      [page.cacheKey]: { ...page, title },
    });
    document.title = "alternet: " + title;
  };

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
          setTitle={setTitle}
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
