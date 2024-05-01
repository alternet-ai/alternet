"use client";

import React, { useState } from "react";

import { Separator } from "@acme/ui/separator";

import type { HistoryEntry, NavigationState } from "./types";
import IframeContainer from "./_components/container";
import HistoryPanel from "./_components/history";
import FloatingLogo from "./_components/logo";
import TopBar from "./_components/topbar";

const ParentComponent = () => {
  const homeEntry: HistoryEntry = {
    title: "Home",
    prompt: "/",
    cacheKey: "home",
  };
  const [mockCache, setMockCache] = useState<Record<string, string>>({
    home: "<html><body><h1>Welcome Home</h1></body></html>",
  });

  const [html, setHtml] = useState(mockCache.home ?? "");
  const [showHistory, setShowHistory] = useState(false);
  const [navState, setNavState] = useState<NavigationState>({
    currentIndex: 0,
    history: [homeEntry],
    bookmarks: [],
  });

  const getPage = async (pageDef: HistoryEntry): Promise<string> => {
    if (pageDef.cacheKey && mockCache[pageDef.cacheKey]) {
      return mockCache[pageDef.cacheKey] ?? "";
    }

    const response = await fetch(`https://httpbin.org/get`);
    const transformedHtml = await response.text();

    setMockCache({
      ...mockCache,
      [pageDef.cacheKey]: transformedHtml,
    });

    return transformedHtml;
  };

  const updateHtmlAndHistory = async (
    index: number,
    history?: HistoryEntry[],
  ) => {
    const entry = history ? history[index] : navState.history[index];
    if (entry === undefined) {
      return;
    }

    const transformedHtml = await getPage(entry);
    setHtml(transformedHtml);

    setNavState({
      ...navState,
      currentIndex: index,
      history: history ?? navState.history,
    });
  };

  const navigateTo = async (address: string) => {
    const newHistory = [...navState.history];
    //slice off the rest of the history if we're not at the end
    if (navState.currentIndex + 1 < newHistory.length) {
      newHistory.splice(navState.currentIndex + 1);
    }
    newHistory.push({
      title: "title for " + address,
      prompt: address,
      cacheKey: crypto.randomUUID(),
    });
    await updateHtmlAndHistory(newHistory.length - 1, newHistory);
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
      await updateHtmlAndHistory(newIndex);
    }
  };

  const refresh = async () => {
    const currentPage = navState.history[navState.currentIndex];
    if (currentPage !== undefined) {
      await navigateTo(currentPage.prompt);
    }
  };

  const addBookmark = () => {
    const currentPage = navState.history[navState.currentIndex];
    if (
      currentPage !== undefined &&
      !navState.bookmarks.includes(currentPage.cacheKey)
    ) {
      setNavState({
        ...navState,
        bookmarks: [...navState.bookmarks, currentPage.cacheKey],
      });
      // Optionally, save bookmarks to a backend or local storage
    }
  };

  const goHome = async () => {
    const newHistory = [homeEntry];
    await updateHtmlAndHistory(0, newHistory);
  };

  const openHistory = () => {
    setShowHistory(!showHistory); // Toggle visibility of the history panel
  };

  const handleSelectHistoryItem = async (index: number) => {
    await updateHtmlAndHistory(index);
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
