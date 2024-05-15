import React, { useEffect, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  RotateCw,
  Share,
  X,
} from "lucide-react";

import { signIn } from "next-auth/react";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import { type User } from "../types";
import FeedbackButton from "./feedback";
import HamburgerMenu from "./hamburger_menu";

interface ButtonsProps {
  onRefresh: () => void;
  onCancel: () => void;
  defaultTitle: string;
  openToProfile: boolean;
  onDownloadPage: () => void;
  onGoHome: () => void;
  isLoading: boolean;
  pageId: string;
  creatorId: string;
  userMetadata: User | undefined;
}

const fixTitle = (title: string) => {
  if (title.startsWith("alternet: ")) {
    return title.split(": ")[1] ?? "";
  }
  return title;
};

const Buttons: React.FC<ButtonsProps> = ({
  onRefresh,
  onCancel,
  defaultTitle,
  openToProfile,
  onDownloadPage,
  onGoHome,
  isLoading,
  pageId,
  creatorId,
  userMetadata,
}) => {
  const utils = api.useUtils();

  const [title, setTitle] = useState(fixTitle(defaultTitle));
  const [isPublic, setIsPublic] = useState(
    userMetadata?.isBookmarkDefaultPublic ?? false,
  );
  const [includeProfile, setIncludeProfile] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getIsBookmarked = api.bookmark.isBookmarked.useMutation({
    onSuccess: async (res) => {
      await utils.bookmark.invalidate();
      setIsBookmarked(!!res);
    },
    onError: (err) => {
      toast.error("Failed to check bookmark: " + err);
    },
  });

  const insertBookmark = api.bookmark.insert.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to update bookmark: " + err);
    },
  });

  const deleteBookmark = api.bookmark.delete.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to delete bookmark: " + err);
    },
  });

  const addBookmark = () => {
    setIsBookmarked(true);
    insertBookmark.mutate({
      bookmarkId: pageId,
      title: title,
      isPublic: isPublic,
    });
  };

  const removeBookmark = () => {
    setIsBookmarked(false);
    deleteBookmark.mutate(pageId);
  };

  useEffect(() => {
    if (userMetadata) getIsBookmarked.mutate(pageId);
  }, [pageId, userMetadata]);

  const isHome = pageId === "home";

  useEffect(() => {
    setTitle(fixTitle(defaultTitle));
  }, [defaultTitle]);

  useEffect(() => {
    setIsPublic(userMetadata?.isBookmarkDefaultPublic ?? false);
  }, [userMetadata]);

  const onCopyLink = (includeProfile: boolean) => {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://alternet.ai";
    const url = includeProfile
      ? `${baseUrl}/${pageId}?profile`
      : `${baseUrl}/${pageId}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex">
      {isLoading ? (
        <Button variant="ghost" onClick={onCancel}>
          <X className="size-[6vw] md:size-6" />
        </Button>
      ) : (
        <Button variant="ghost" onClick={onRefresh} disabled={isLoading}>
          <RotateCw className="size-[6vw] md:size-6" />
        </Button>
      )}
      <HamburgerMenu
        creatorId={creatorId}
        openToProfile={openToProfile}
        onGoHome={onGoHome}
        isHome={isHome}
        isLoading={isLoading}
        userMetadata={userMetadata}
      />
      <FeedbackButton pageId={pageId} />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" disabled={isHome}>
            <Share className="size-[6vw] md:size-6" />
            <span className="sr-only">Share</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col space-y-4 py-6">
            <div className="flex items-center space-x-4">
              <DialogClose asChild>
                <Button
                  onClick={() => onCopyLink(includeProfile)}
                  className="flex-1"
                >
                  copy link
                </Button>
              </DialogClose>
              <div className="flex items-center space-x-2">
                <Label htmlFor="profile" className="text-sm font-medium">
                  open to profile
                </Label>
                <Switch
                  id="profile"
                  checked={includeProfile}
                  onCheckedChange={setIncludeProfile}
                />
              </div>
            </div>
            <div>
              <DialogClose asChild>
                <Button onClick={onDownloadPage} className="w-full">
                  download page
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isBookmarked ? (
        <Button variant="ghost" onClick={removeBookmark}>
          <BookmarkCheck className="size-[6vw] md:size-6" />
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" disabled={isHome || isLoading} onClick={() => !userMetadata ? signIn('discord') : {} }>
              <Bookmark className="size-[6vw] md:size-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="visibility" className="text-right">
                  Public
                </Label>
                <Switch
                  id="visibility"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="col-span-3"
                />
              </div>
              <DialogClose asChild>
                <Button onClick={addBookmark}>Add Bookmark</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Buttons;
