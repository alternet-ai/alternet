"use client";

import React, { useState } from "react";

import { Separator } from "@acme/ui/separator";

import IframeContainer from "./_components/container";
import HistoryPanel from "./_components/history";
import FloatingLogo from "./_components/logo";
import TopBar from "./_components/topbar";

interface HistoryEntry {
  title: string;
  url: string;
  cacheKey: string;
}

interface NavigationState {
  currentIndex: number;
  history: HistoryEntry[];
  bookmarks: string[];
}

const getPage = async (pageDef: HistoryEntry): Promise<string> => {
  const mockCache: Record<string, string> = {
    home: "<html><body><h1>Welcome Home</h1></body></html>",
  };
  // Perform the necessary transformation logic here
  // This could involve making API calls, parsing the address, etc.
  console.log(pageDef);

  if (pageDef.cacheKey && mockCache[pageDef.cacheKey]) {
    return mockCache[pageDef.cacheKey] ?? '';
  }

  const response = await fetch(`https://httpbin.org/get`);
  const transformedHtml = await response.text();
  return transformedHtml;
};

const ParentComponent = () => {
  const [html, setHtml] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [navState, setNavState] = useState<NavigationState>({
    currentIndex: -1,
    history: [],
    bookmarks: [],
  });

  const updateHtmlAndHistory = async (index: number, history?: HistoryEntry[]) => {
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
      title: 'whatever',
      url: address,
      cacheKey: address,
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
    const currentAddress = navState.history[navState.currentIndex];
    if (currentAddress !== undefined) {
      await navigateTo(currentAddress);
    }
  };

  const addBookmark = () => {
    const currentAddress = navState.history[navState.currentIndex];
    if (
      currentAddress !== undefined &&
      !navState.bookmarks.includes(currentAddress)
    ) {
      setNavState({
        ...navState,
        bookmarks: [...navState.bookmarks, currentAddress],
      });
      // Optionally, save bookmarks to a backend or local storage
    }
  };

  const goHome = async () => {
    const newHistory = ["home"];
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
