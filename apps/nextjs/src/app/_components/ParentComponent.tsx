"use client";

import type { Message } from "ai";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";

import { toast } from "@acme/ui/toast";

import type { Page } from "../types";
import { api } from "~/trpc/react";
import { useAppContext } from "../AppContext";
import { BLANK_PAGE, HOME_PAGE } from "../static/constants";
import AddressBar from "./address_bar";
import Buttons from "./buttons";
import IframeContainer from "./container";

interface ParentComponentProps {
  initialPage: string;
  openToProfile: boolean;
}

const ParentComponent = ({
  initialPage,
  openToProfile,
}: ParentComponentProps) => {
  const router = useRouter();
  const { pageCache, model, setModel } = useAppContext();
  const [isPortrait, setIsPortrait] = useState(false);
  const userMetadata = api.auth.getOwnMetadata.useQuery().data;
  const [currentPage, setCurrentPage] = useState<Page>(BLANK_PAGE);
  const { reload, stop, isLoading, messages, setMessages } = useChat({
    body: { model },
  });

  const utils = api.useUtils();

  const savePage = api.page.save.useMutation({
    onSuccess: async () => {
      await utils.pageView.invalidate();
    },

    onError: (err) => {
      toast.error("Error saving page: " + err);
    },
  });

  const loadPage = api.page.load.useMutation({
    onSuccess: async (res) => {
      await utils.pageView.invalidate();
    },

    onError: (err) => {
      toast.error("Error loading page: " + err);
    },
  });

  useLayoutEffect(() => {
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

  const getPage = async (id: string) => {
    let page = pageCache.current[id];

    if (!page) {
      console.log("cache miss: fetching page for ", id);
      page = await loadPage.mutateAsync(id);
      if (!page) {
        throw new Error("Page not found");
      }

      pageCache.current = {
        ...pageCache.current,
        [page.id]: page,
      };
    }
    return page;
  };

  const getCachedPage = async (id: string) => {
    // const urlString = `${DEPLOYMENT_URL}/api/load-page?cacheKey=${id}`;
    // console.log("running delete", urlString);
    // await fetch(urlString);

    try {
      const page = await getPage(id);
      setCurrentPage(page);
    } catch (error) {
      console.error(`Error fetching page to serve for key ${id}: `, error);
      router.push(`/home`);
    }
  };

  useEffect(() => {
    getCachedPage(initialPage);
  }, [initialPage]);

  const generatePage = async (prompt: string) => {
    if (!userMetadata) {
      throw new Error("User metadata not found");
    }

    await linearizeUniverse(prompt);
    reload();

    const page: Page = {
      title: "Loading...",
      fakeUrl: "Loading...",
      prompt,
      content: currentPage.content,
      id: crypto.randomUUID(),
      userId: userMetadata.id,
      parentId: currentPage.id,
      response: "",
    };

    setCurrentPage(page);
  };

  const refresh = () => {
      generatePage(currentPage.prompt);
  };

  const goHome = () => {
    router.push(`/home`);
  };

  useEffect(() => {
    //finalize page if loading changes and we're not on the initial page. todo: better way to do this
    const isStartPage = currentPage.id === initialPage;
    if (!isLoading && !isStartPage) {
      updateCurrentPage(true);
    }
  }, [isLoading]);

  const linearizeUniverse = async (prompt: string) => {
    let pageAncestors = [currentPage];
    let parentId = currentPage.parentId;

    while (parentId !== HOME_PAGE.parentId) {
      let parentPage: Page;
      try {
        parentPage = await getPage(parentId);
      } catch (error) {
        console.error(`Error getting parent page for key ${parentId}: `, error);
        break;
      }
      pageAncestors.push(parentPage);
      parentId = parentPage.parentId;
    }

    if (!currentPage.response) {
      console.error(
        "Could not find response for current page with key: ",
        currentPage.id,
      );
    }

    const isEdit = currentPage.response?.includes("<replacementsToMake>");

    let promptWithContext = prompt;
    if (isEdit) {
      promptWithContext +=
        "\n<currentPage>\n" + currentPage.content + "\n</currentPage>";
    }

    const lastFullPageIndex = pageAncestors.findIndex(
      (page) => !page.response?.includes("<replacementsToMake>"),
    );
    if (lastFullPageIndex === -1) {
      console.error("Couldn't get last full page");
    } else {
      pageAncestors = pageAncestors.slice(0, lastFullPageIndex + 1);
    }

    const newMessages: Message[] = [];

    for (const page of pageAncestors.reverse()) {
      const userMsg: Message = {
        role: "user",
        content: page.prompt,
        id: newMessages.length.toString(),
      };
      newMessages.push(userMsg);

      if (!page.response) {
        console.error("Could not find response for page with key: ", page.id);
      }
      const assistantMsg: Message = {
        role: "assistant",
        content: page.response ?? page.content,
        id: newMessages.length.toString(),
      };
      newMessages.push(assistantMsg);
    }

    const promptMsg = {
      role: "user",
      content: promptWithContext,
      id: messages.length.toString(),
    } as Message;

    newMessages.push(promptMsg);

    setMessages(newMessages);
  };

  const updateContent = (edit: string, lastPageContent: string) => {
    let changes = [];
    const replacementRegex = /<replacement>([\s\S]*?)(<\/replacement>|$)/gs;
    const oldContentRegex = /<oldContent>([\s\S]*?)(<\/oldContent>|$)/s;
    const newContentRegex = /<newContent>([\s\S]*?)(<\/newContent>|$)/s;

    const matches = edit.match(replacementRegex);
    if (!matches) {
      return lastPageContent;
    }

    for (const match of matches) {
      const oldContentMatch = match.match(oldContentRegex)?.[1];
      if (!oldContentMatch) {
        continue;
      }

      //placeholder that replaces all non-whitespace with xs
      const placeholder = oldContentMatch
        .split("\n")
        .map((line) =>
          line
            .split(" ")
            .map((word) => "x".repeat(word.length))
            .join(" "),
        )
        .join("\n");
      const newContentMatch = match.match(newContentRegex)?.[1] ?? placeholder;
      const oldContent = oldContentMatch
        .split("\n")
        .map((line) => {
          return line.trim();
        })
        .join("\n");
      const newContent = newContentMatch
        .split("\n")
        .map((line) => {
          return line.trim();
        })
        .join("\n");

      changes.push({
        oldContent,
        newContent,
      });
    }

    let modifiedPage = lastPageContent;
    modifiedPage = modifiedPage
      .split("\n")
      .map((line) => {
        return line.trim();
      })
      .join("\n");

    for (const change of changes) {
      const { oldContent, newContent } = change;
      if (oldContent === undefined || newContent === undefined) {
        console.error(
          "oldContent or newContent is undefined for change: ",
          change,
        );
      } else if (!modifiedPage.includes(oldContent)) {
        console.error(
          "error applying edit: modification not found in page. old content: ",
          oldContent.length > 100
            ? oldContent.substring(0, 100) + "..."
            : oldContent,
          "new content: ",
          newContent.length > 100
            ? newContent.substring(0, 100) + "..."
            : newContent,
        );
      } else {
        modifiedPage = modifiedPage.replaceAll(oldContent, newContent);
      }
    }

    return modifiedPage;
  };

  const removeAnalysis = (content: string, lastPageContent: string) => {
    const analysisStartIndex = content.indexOf("<analysis>");
    const analysisEndIndex = content.indexOf("</analysis>");

    //analysis started but not ended
    if (analysisStartIndex !== -1 && analysisEndIndex === -1) {
      return lastPageContent;
      //no analysis yet
    } else if (
      analysisStartIndex === -1 &&
      analysisEndIndex === -1 &&
      content.length < "<analysis>".length
    ) {
      return lastPageContent;
      //no analysis
    } else if (analysisStartIndex === -1 && analysisEndIndex === -1) {
      return content;
      //analysis complete
    } else if (analysisStartIndex !== -1 && analysisEndIndex !== -1) {
      return content.slice(analysisEndIndex + "</analysis>".length);
    } else {
      throw new Error("somehow analysis has been ended but not started?");
    }
  };

  const updateCurrentPage = async (isFinal?: boolean) => {
    let content;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      content = lastMessage.content;
    } else {
      return;
    }

    let lastPageContent = "";
    try {
      const lastPage = await getPage(currentPage.parentId);
      lastPageContent = lastPage.content;
    } catch (error) {
      console.error(
        "Could not find last page for cache key: " + currentPage.id,
      );
    }

    const isEdit = content.includes("<replacementsToMake>");
    const newContent = isEdit
      ? updateContent(content, lastPageContent)
      : removeAnalysis(content, lastPageContent);

    const pageTitle = newContent.match(/<title>([^<]+)<\/title>/)?.[1];
    let title = pageTitle
      ? "alternet: " + pageTitle
      : isFinal
        ? currentPage.prompt
        : currentPage.title;
    let url =
      newContent.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ??
      (isFinal ? currentPage.prompt : currentPage.fakeUrl);

    const page = {
      ...currentPage,
      content: newContent,
      fakeUrl: url,
      title: title,
      response: content,
    };

    setCurrentPage(page);
    if (!page.parentId) {
      throw new Error("Could not find parentId for current page");
    }

    if (isFinal) {
      pageCache.current = {
        ...pageCache.current,
        [page.id]: page,
      };

      savePage.mutate({
        title: page.title,
        fakeUrl: page.fakeUrl,
        prompt: page.prompt,
        content: page.content,
        id: page.id,
        response: page.response,
        parentId: page.parentId,
      });

      router.push(`/${page.id}`);
    }
  };

  useEffect(() => {
    updateCurrentPage();
  }, [messages]);

  useEffect(() => {
    document.title = currentPage.title;
  }, [currentPage.title]);

  const onDownloadPage = () => {
    const blob = new Blob([currentPage.content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${currentPage.id}.html`);
    link.click();
  };

  const changeModel = () => {
    setModel(
      model === "claude-3-sonnet-20240229"
        ? "claude-3-opus-20240229"
        : "claude-3-sonnet-20240229",
    );
  };

  const buttons = userMetadata && (
    <Buttons
      onRefresh={refresh}
      onCancel={stop}
      defaultTitle={currentPage.title}
      openToProfile={openToProfile}
      onDownloadPage={onDownloadPage}
      onGoHome={goHome}
      isLoading={isLoading}
      pageId={currentPage.id}
      creatorId={currentPage.userId}
      userMetadata={userMetadata}
    />
  );

  return (
    <div className="flex h-svh w-full">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-background p-2">
          <AddressBar
            currentUrl={currentPage.fakeUrl}
            onAddressEntered={generatePage}
            disabled={isLoading}
            changeModel={changeModel}
            model={model}
          />
          {!isPortrait && buttons}
        </div>
        <div className="flex flex-1 overflow-hidden">
          <IframeContainer
            html={currentPage.content}
            isLoading={isLoading}
            onNavigate={generatePage}
          />
        </div>
        {isPortrait && (
          <div className="flex items-center justify-around border-b bg-background p-2">
            {buttons}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentComponent;
