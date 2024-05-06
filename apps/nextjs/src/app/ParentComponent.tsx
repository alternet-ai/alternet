"use client";

import type { Message } from "ai";
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";

import { Separator } from "@acme/ui/separator";
import { toast } from "@acme/ui/toast";

import type { NavigationState, Page, User } from "./types";
import { api } from "~/trpc/react";
import AddressBar from "./_components/address_bar";
import IframeContainer from "./_components/container";
import EditProfileDialog from "./_components/edit_profile";
import HistoryPanel from "./_components/history";
import LeftButtons from "./_components/left_buttons";
import FloatingLogo from "./_components/logo";
import ProfileDialog from "./_components/profile";
import RightButtons from "./_components/right_buttons";
import { env } from "~/env";
import { HOME_PAGE } from "./static/constants";

interface ParentComponentProps {
  initialPage?: Page;
  profile?: boolean;
}

const ParentComponent = ({
  initialPage = HOME_PAGE,
  profile = false,
}: ParentComponentProps) => {
  const { status } = useSession();
  const [isPortrait, setIsPortrait] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(profile);
  const [profileData, setProfileData] = useState<User | undefined>(undefined);
  const pageCache = useRef<Record<string, Page>>({});
  const userMetadata = api.auth.getOwnMetadata.useQuery().data;

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

  const utils = api.useUtils();

  const insertBookmark = api.bookmark.insert.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update a bookmark"
          : "Failed to update bookmark",
      );
    },
  });

  const deleteBookmark = api.bookmark.delete.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to delete a bookmark"
          : "Failed to delete bookmark",
      );
    },
  });

  const getIsBookmarked = api.bookmark.isBookmarked.useMutation({
    onSuccess: async (res) => {
      await utils.bookmark.invalidate();
      setIsBookmarked(!!res);
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to check a bookmark"
          : "Failed to check bookmark",
      );
    },
  });

  const getProfile = api.auth.getUserMetadata.useMutation({
    onSuccess: async (res) => {
      await utils.bookmark.invalidate();
      setProfileData(res);
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to get a profile"
          : "Failed to get profile",
      );
    },
  });

  useEffect(() => {
    if (profile) {
      if (!initialPage.userId) {
        setIsProfileDialogOpen(false);
        throw new Error(
          "User ID is not set for linked page. Closed profile dialog",
        );
      }

      getProfile.mutate(initialPage.userId);
    }
  }, [profile, initialPage.userId]);

  const toggleProfileDialog = () => {
    setIsProfileDialogOpen(!isProfileDialogOpen);
  };

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
    if (status === "loading") {
      return;
    }
    resetToPage(initialPage);
  }, [initialPage, status]);

  const getCachedPage = (cacheKey: string) => {
    const cachedPage = pageCache.current[cacheKey];

    if (cachedPage) {
      getIsBookmarked.mutate(cacheKey);

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

    if (!userMetadata?.id) {
      throw new Error("User ID is not set");
    }

    const page: Page = {
      title: "Loading...",
      fakeUrl: "Loading...",
      prompt,
      content: "",
      cacheKey: crypto.randomUUID(),
      userId: userMetadata.id,
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

  const addBookmark = (title: string, isPublic: boolean) => {
    const cacheKey = navState.current.history[navState.current.currentIndex];
    if (!cacheKey) {
      throw new Error("Could not find cache key for adding bookmark");
    }

    if (status === "authenticated") {
      setIsBookmarked(true);
      insertBookmark.mutate({
        bookmarkId: cacheKey,
        title: title,
        isPublic: isPublic,
      });
    } else {
      toast.error("You must be logged in to add a bookmark");
    }
  };

  const removeBookmark = () => {
    const cacheKey = navState.current.history[navState.current.currentIndex];
    if (!cacheKey) {
      throw new Error("Could not find cache key for adding bookmark");
    }
    setIsBookmarked(false);
    deleteBookmark.mutate(cacheKey);
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
  };

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

  const toggleEditProfileDialog = () => {
    setIsEditProfileDialogOpen(!isEditProfileDialogOpen);
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

  const showOwnProfile = () => {
    setProfileData(userMetadata);
    toggleProfileDialog();
  };

  const showProfile = () => {
    const cacheKey = navState.current.history[navState.current.currentIndex];
    if (!cacheKey) {
      throw new Error("Could not find cache key for showing profile");
    }

    const currentPage = pageCache.current[cacheKey];
    if (!currentPage) {
      throw new Error("Could not find page for showing profile");
    }

    if (!currentPage.userId) {
      throw new Error("Could not find user ID for showing profile");
    }

    getProfile.mutate(currentPage.userId);
    toggleProfileDialog();
  };

  const onCopyLink = (includeProfile: boolean) => {
    const baseUrl = env.NEXT_PUBLIC_API_BASE_URL + '/' + navState.current.history[navState.current.currentIndex];
    const url = includeProfile ? `${baseUrl}?profile` : baseUrl;
    navigator.clipboard.writeText(url);
  };

  const onDownloadPage = () => {
    const cacheKey = navState.current.history[navState.current.currentIndex];
    if (!cacheKey) {
      throw new Error("Could not find cache key for downloading page");
    }
    const page = pageCache.current[cacheKey];
    if (!page) {
      throw new Error("Could not find page for downloading page");
    }
    
    const html = page.content;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${cacheKey}.html`);
    link.click();
  };


  return (
    <div className="flex h-screen w-screen">
      <EditProfileDialog
        open={isEditProfileDialogOpen}
        onClose={toggleEditProfileDialog}
      />
      {isProfileDialogOpen && profileData && (
        <ProfileDialog
          open={isProfileDialogOpen}
          onClose={toggleProfileDialog}
          profileData={profileData}
        />
      )}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b bg-background p-2">
          {!isPortrait && (
            <LeftButtons
              onBack={goBack}
              onForward={goForward}
              onRefresh={refresh}
              onGoHome={goHome}
              disabled={isLoading}
              onCancel={cancelGeneration}
            />
          )}
          <AddressBar
            currentUrl={currentUrl}
            onAddressEntered={generatePage}
            disabled={isLoading}
          />
          {!isPortrait && (
            <RightButtons
              onAddBookmark={addBookmark}
              onDeleteBookmark={removeBookmark}
              onOpenHistory={openHistory}
              defaultTitle={title}
              defaultIsPublic={userMetadata?.isBookmarkDefaultPublic ?? false}
              isBookmarked={isBookmarked}
              onEditProfile={toggleEditProfileDialog}
              onViewProfile={showProfile}
              onViewYourProfile={showOwnProfile}
              onCopyLink={onCopyLink}
              onDownloadPage={onDownloadPage}
            />
          )}
        </div>
        <IframeContainer
          html={html}
          isLoading={isLoading}
          onNavigate={generatePage}
        />
        <FloatingLogo src="alternet" isPortrait={isPortrait} />
        {isPortrait && (
          <div className="flex items-center justify-around border-b bg-background p-2">
            <LeftButtons
              onBack={goBack}
              onForward={goForward}
              onRefresh={refresh}
              onGoHome={goHome}
              disabled={isLoading}
              onCancel={cancelGeneration}
            />
            <RightButtons
              onAddBookmark={addBookmark}
              onDeleteBookmark={removeBookmark}
              onOpenHistory={openHistory}
              defaultTitle={title}
              defaultIsPublic={userMetadata?.isBookmarkDefaultPublic ?? false}
              isBookmarked={isBookmarked}
              onEditProfile={toggleEditProfileDialog}
              onViewProfile={showProfile}
              onViewYourProfile={showOwnProfile}
              onCopyLink={onCopyLink}
              onDownloadPage={onDownloadPage}
            />
          </div>
        )}
      </div>
      {showHistory && (
        <>
          <Separator orientation="vertical"/>
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
