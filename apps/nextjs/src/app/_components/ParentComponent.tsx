"use client";

import type { Message } from "ai";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";

import { toast } from "@acme/ui/toast";

import type { Page } from "../types";
import { api } from "~/trpc/react";
import { useAppContext } from "../AppContext";
import { HOME_PAGE } from "../static/constants";
import { DEPLOYMENT_URL } from "../utils/url";
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
  const { pageCache, setPageCache, model, setModel } = useAppContext();
  const [isPortrait, setIsPortrait] = useState(false);
  const userMetadata = api.auth.getOwnMetadata.useQuery().data;
  const [currentPage, setCurrentPage] = useState<Page>(HOME_PAGE);
  const { reload, stop, isLoading, messages, setMessages } = useChat({
    body: { model },
  });

  const utils = api.useUtils();

  const pageView = api.pageView.view.useMutation({
    onSuccess: async () => {
      await utils.pageView.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to view a page"
          : "Failed to view page: " + err.message,
      );
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

  const getCachedPage = async (cacheKey: string) => {
    let page = pageCache[cacheKey];

    if (!page) {
      try {
        const urlString = `${DEPLOYMENT_URL}/api/load-page?cacheKey=${cacheKey}`;
        console.log("cache miss: fetching page from", urlString);
        const response = await fetch(urlString);
        page = (await response.json()) as Page;
        setPageCache({
          ...pageCache,
          [page.cacheKey]: page,
        });
      } catch (error) {
        console.error(
          `Error fetching page to serve for key ${cacheKey}: `,
          error,
        );
        router.push(`/home`);
        //unreachable?
        return;
      }
    }

    pageView.mutate(cacheKey);
    setCurrentPage(page);
  };

  useEffect(() => {
    getCachedPage(initialPage);
  }, [initialPage]);

  const generatePage = (prompt: string) => {
    if (!userMetadata) {
      throw new Error("User metadata not found");
    }

    linearizeUniverse(prompt);
    reload();

    const page: Page = {
      title: "Loading...",
      fakeUrl: "Loading...",
      prompt,
      content: currentPage.content,
      cacheKey: crypto.randomUUID(),
      userId: userMetadata.id,
      parentId: currentPage.cacheKey,
      response: "",
    };

    setCurrentPage(page);
  };

  const refresh = () => {
    const prompt = currentPage.prompt;

    if (prompt) {
      generatePage(prompt);
    } else {
      throw new Error("Current page prompt undefined while refreshing");
    }
  };

  const goHome = () => {
    //todo: redirect to /home
    console.log("getting home page, cache key: ", HOME_PAGE.cacheKey);
    router.push(`/home`);
  };

  useEffect(() => {
    //finalize page if loading changes and we're not on the initial page. todo: better way to do this
    const isStartPage = currentPage.cacheKey === initialPage;
    if (!isLoading && !isStartPage) {
      updateCurrentPage(true);
    }
  }, [isLoading]);

  const linearizeUniverse = (prompt: string) => {
    let pageAncestors = [currentPage];
    let parentId = currentPage.parentId;

    while (parentId !== undefined && parentId !== HOME_PAGE.parentId) {
      //todo: deal with undefined better (it's legacy support). do some kinda migration?
      const parentPage = pageCache[parentId]; //todo: get parent from remote instead
      if (!parentPage) {
        console.error("Could not find parent page for key: ", parentId);
        break;
      }

      pageAncestors.push(parentPage);
      parentId = parentPage.parentId;
    }

    if (!currentPage.response) {
      console.error(
        "Could not find response for current page with key: ",
        currentPage.cacheKey,
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
        console.error(
          "Could not find response for page with key: ",
          page.cacheKey,
        );
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

  const updateContent = (edit: string) => {
    const lastPage = pageCache[currentPage.parentId ?? "invalid"];
    if (!lastPage) {
      throw new Error(
        "Could not find last page for cache key: " + currentPage.cacheKey,
      );
    }

    let changes = [];
    const replacementRegex = /<replacement>([\s\S]*?)(<\/replacement>|$)/gs;
    const oldContentRegex = /<oldContent>([\s\S]*?)(<\/oldContent>|$)/s;
    const newContentRegex = /<newContent>([\s\S]*?)(<\/newContent>|$)/s;

    const matches = edit.match(replacementRegex);
    if (!matches) {
      return lastPage.content;
    }

    for (const match of matches) {
      const oldContentMatch = match.match(oldContentRegex)?.[1];
      if (!oldContentMatch) {
        //console.error("Couldn't get old content from: ", edit);
        continue;
      }

      //make placeholder that replaces all non-whitespace with xs
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
      // if (!newContentMatch) {
      //   console.error("Couldn't get new content from: ", edit);
      //   continue;
      // }
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

    let modifiedPage = lastPage.content;
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

  const removeAnalysis = (content: string) => {
    const analysisStartIndex = content.indexOf("<analysis>");
    const analysisEndIndex = content.indexOf("</analysis>");

    //todo: I thnk this is firing incorrectly
    const lastPage = pageCache[currentPage.parentId ?? "invalid"];
    let lastPageContent = "";
    if (!lastPage) {
      console.error(
        "Could not find last page for cache key: " + currentPage.cacheKey,
      );
    } else {
      lastPageContent = lastPage.content;
    }

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

  const updateCurrentPage = (isFinal?: boolean) => {
    let content;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      content = lastMessage.content;
    } else {
      return;
    }

    const isEdit = content.includes("<replacementsToMake>");
    const newContent = isEdit
      ? updateContent(content)
      : removeAnalysis(content);

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

    if (isFinal) {
      setPageCache({
        ...pageCache,
        [page.cacheKey]: page,
      });

      pageView.mutate(currentPage.cacheKey);

      try {
        fetch("/api/save-page", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(page),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to save page: " + res.statusText);
            }
            router.push(`/${page.cacheKey}`);
          })
          .catch((error) => {
            throw error;
          });
      } catch (error) {
        throw new Error("Error saving page: " + error);
      }
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
    link.setAttribute("download", `${currentPage.cacheKey}.html`);
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
      pageId={currentPage.cacheKey}
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
