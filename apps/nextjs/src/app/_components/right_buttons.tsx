import React, { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Clock, Share } from "lucide-react";

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

import HamburgerMenu from "./hamburger_menu";

interface RightButtonsProps {
  onAddBookmark: (title: string, isPublic: boolean) => void;
  onDeleteBookmark: () => void;
  onOpenHistory: () => void;
  defaultTitle: string;
  defaultIsPublic: boolean;
  isBookmarked: boolean;
  onEditProfile: () => void;
  onViewProfile: () => void;
  onViewYourProfile: () => void;
  onCopyLink: (includeProfile: boolean) => void;
  onDownloadPage: () => void;
}

const RightButtons: React.FC<RightButtonsProps> = ({
  onAddBookmark,
  onDeleteBookmark,
  onOpenHistory,
  defaultTitle,
  defaultIsPublic,
  isBookmarked,
  onEditProfile,
  onViewProfile,
  onViewYourProfile,
  onCopyLink,
  onDownloadPage,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [includeProfile, setIncludeProfile] = useState(true);

  useEffect(() => {
    setTitle(defaultTitle);
  }, [defaultTitle]);

  useEffect(() => {
    setIsPublic(defaultIsPublic);
  }, [defaultIsPublic]);

  const handleAddBookmark = () => {
    onAddBookmark(title, isPublic);
  };

  return (
    <div className="flex space-x-2">
      <HamburgerMenu
        onEditProfile={onEditProfile}
        onViewProfile={onViewProfile}
        onViewYourProfile={onViewYourProfile}
        isHome={defaultTitle === "alternet: home"}
      />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <Share className="h-4 w-4" />
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
                <Button
                  onClick={onDownloadPage}
                  className="w-full"
                >
                  download page
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isBookmarked ? (
        <Button variant="ghost" onClick={onDeleteBookmark}>
          <BookmarkCheck />
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" disabled={title === "alternet: home"}>
              <Bookmark />
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
                <Button onClick={handleAddBookmark}>Add Bookmark</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <Button variant="ghost" onClick={onOpenHistory}>
        <Clock />
      </Button>
    </div>
  );
};

export default RightButtons;
