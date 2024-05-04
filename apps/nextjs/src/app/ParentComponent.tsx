"use client";

import type { Message } from "ai";
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";

import { Separator } from "@acme/ui/separator";

import type { NavigationState, Page } from "./types";
import BottomBar from "./_components/bottombar";
import IframeContainer from "./_components/container";
import HistoryPanel from "./_components/history";
import FloatingLogo from "./_components/logo";
import TopBar from "./_components/topbar";
import { HOME_HTML } from "./static/home-html";

export const HOME_KEY = "home";
const HOME_PAGE: Page = {
  title: "alternet: home",
  prompt: "https://alternet.ai/home",
  fakeUrl: "https://alternet.ai/home",
  content: HOME_HTML,
  cacheKey: HOME_KEY,
};

interface ParentComponentProps {
  initialPage?: Page;
}

const ParentComponent = ({ initialPage = HOME_PAGE }: ParentComponentProps) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const pageCache = useRef<Record<string, Page>>({});

  //const [siteMap, setSiteMap] = useState<Record<string, string>>({});

  const navState = useRef<NavigationState>({
    currentIndex: -1,
    history: [],
  });

  const [html, setHtml] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [title, setTitle] = useState("");

  const { append, stop, isLoading, messages, setMessages } = useChat({
    initialMessages: [],

    onFinish: (message) => {
      updateCurrentPage(message, true);
    },

    onError: (error) => {
      throw error;
    },
  });

  const [showHistory, setShowHistory] = useState(true); //todo: false?

  useEffect(() => {
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

  useEffect(() => {
    resetToPage(initialPage);
  }, [initialPage]);

  const getCachedPage = (cacheKey: string) => {
    const cachedPage = pageCache.current[cacheKey];

    if (cachedPage) {
      setHtml(cachedPage.content);
      setCurrentUrl(cachedPage.fakeUrl);
      setTitle(cachedPage.title);

      const newUrl = `/${cacheKey}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    } else {
      throw new Error("Cache key is not valid");
    }
  };

  const generatePage = (prompt: string) => {
    setHtml("");

    void append(
      {
        role: "user",
        content: prompt,
      },
      { options: { body: { lastIndex: navState.current.currentIndex } } },
    );

    const page: Page = {
      title: "Loading...",
      fakeUrl: "Loading...",
      prompt,
      content: "",
      cacheKey: crypto.randomUUID(),
    };

    pageCache.current = {
      ...pageCache.current,
      [page.cacheKey]: page,
    };

    navState.current = {
      currentIndex: navState.current.history.length,
      history: [...navState.current.history, page.cacheKey],
    };

    const newUrl = `/${page.cacheKey}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const refresh = () => {
    const cacheKey =
      navState.current.history[navState.current.currentIndex] ?? "";
    const page = pageCache.current[cacheKey];
    const prompt = page?.prompt;
    navState.current.currentIndex -= 1; //adjust to prompt from prior page
    if (prompt !== undefined) {
      generatePage(prompt);
    } else {
      throw new Error("Current page prompt undefined while refreshing");
    }
  };

  const goBack = () => {
    if (navState.current.currentIndex > 0) {
      const newIndex = navState.current.currentIndex - 1;
      handleSelectHistoryItem(newIndex);
    }
  };

  const goForward = () => {
    if (navState.current.currentIndex < navState.current.history.length - 1) {
      const newIndex = navState.current.currentIndex + 1;
      handleSelectHistoryItem(newIndex);
    }
  };

  const handleSelectHistoryItem = (index: number) => {
    const cacheKey = navState.current.history[index];
    if (!cacheKey) {
      throw new Error(
        "Somehow the cache key is undefined when moving in the history",
      );
    }

    getCachedPage(cacheKey);

    navState.current = {
      ...navState.current,
      currentIndex: index,
    };
  };

  const addBookmark = () => {
    // const cacheKey = navState.current.history[navState.current.currentIndex];
    // if (cacheKey !== undefined && !navState.current.bookmarks.includes(cacheKey)) {
    //   navState.current.bookmarks = [...navState.current.bookmarks, cacheKey];
    //   // Optionally, save bookmarks to a backend or local storage
    // }
  };


  const resetToPage = (page: Page) => {
    pageCache.current = {
      [page.cacheKey]: page,
    };
    navState.current = {
      history: [page.cacheKey],
      currentIndex: 0,
    };

    setMessages([
      { role: "user", content: page.prompt, id: "1" },
      {
        role: "assistant",
        content: page.content,
        id: "2",
      },
    ]);

    getCachedPage(page.cacheKey);
  }

  const goHome = () => {
    resetToPage(HOME_PAGE);
  };

  const cancelGeneration = () => {
    stop();
    updateCurrentPage(messages[messages.length - 1] as Message, true);
  };

  const openHistory = () => {
    setShowHistory(!showHistory); // Toggle visibility of the history panel
  };

  const updateCurrentPage = (message: Message, isFinal?: boolean) => {
    setHtml(message.content);
    const title =
      "alternet: " +
      (message.content.match(/<title>([^<]+)<\/title>/)?.[1] ?? "Loading...");
    setTitle(title);
    const url =
      message.content.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ??
      "Loading...";
    setCurrentUrl(url);

    if (isFinal) {
      let finalUrl = url;
      let finalTitle = title;

      if (finalUrl == "Loading...") {
        const currentIndex = navState.current.currentIndex;
        const cacheKey = navState.current.history[currentIndex];
        if (!cacheKey) {
          throw new Error("Could not find cache key for final URL???");
        }
        const currentPage = pageCache.current[cacheKey];
        if (!currentPage) {
          throw new Error("Could not find prompt for final URL???");
        }
        const prompt = currentPage.prompt;

        finalUrl = prompt;
        setCurrentUrl(finalUrl);
      }

      if (finalTitle == "alternet: Loading...") {
        finalTitle = "alternet: " + finalUrl;
        setTitle(finalTitle);
      }

      const cacheKey = navState.current.history[navState.current.currentIndex];
      if (!cacheKey) {
        throw new Error(
          "Cache key is not valid when writing new message: " + cacheKey,
        );
      }

      const currPage = pageCache.current[cacheKey];
      if (!currPage) {
        throw new Error("Could not find page for final URL???");
      }

      const finalPage = {
        ...currPage,
        content: message.content,
        fakeUrl: finalUrl,
        title: finalTitle,
      };

      pageCache.current = {
        ...pageCache.current,
        [cacheKey]: finalPage,
      };

      try {
        fetch("/api/save-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalPage),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to save page");
            }
          })
          .catch((error) => {
            throw error;
          });
      } catch (error) {
        console.error("Error saving page:", error);
      }
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
          disabled={isLoading}
          currentUrl={currentUrl}
          onAddressEntered={generatePage}
          onBack={goBack}
          onForward={goForward}
          onRefresh={refresh}
          onBookmark={addBookmark}
          onGoHome={goHome}
          onOpenHistory={openHistory}
          onCancel={cancelGeneration}
        />
        <IframeContainer
          html={html}
          isLoading={isLoading}
          onNavigate={generatePage}
        />
        <FloatingLogo src="alternet" isPortrait={isPortrait} />
        {isPortrait && (
          <BottomBar
            disabled={isLoading}
            onBack={goBack}
            onForward={goForward}
            onRefresh={refresh}
            onBookmark={addBookmark}
            onGoHome={goHome}
            onOpenHistory={openHistory}
            onCancel={cancelGeneration}
          />
        )}
      </div>
      {showHistory && (
        <>
          <Separator orientation="vertical" className="h-full" />
          <HistoryPanel
            history={
              navState.current.history
                .map((cacheKey) => pageCache.current[cacheKey])
                .filter((page) => page !== undefined) as Page[]
            }
            onSelect={handleSelectHistoryItem}
            setOpen={setShowHistory}
            disabled={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default ParentComponent;
