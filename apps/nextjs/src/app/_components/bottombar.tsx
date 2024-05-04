import React, { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  LogOut,
  RotateCw,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@acme/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";
import { ThemeToggle } from "@acme/ui/theme";
import { api } from "~/trpc/react";

interface BottomBarProps {
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onAddBookmark: (title: string, isPublic: boolean) => void;
  onDeleteBookmark: () => void;
  onGoHome: () => void;
  onOpenHistory: () => void;
  disabled: boolean;
  onCancel: () => void;
  defaultTitle: string;
  defaultIsPublic: boolean;
  cacheKey: string;
}

const BottomBar: React.FC<BottomBarProps> = ({
  onBack,
  onForward,
  onRefresh,
  onAddBookmark,
  onDeleteBookmark,
  onGoHome,
  onOpenHistory,
  disabled,
  onCancel,
  defaultTitle,
  defaultIsPublic,
  cacheKey
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleAddBookmark = () => {
    onAddBookmark(title, isPublic);
    setTitle(defaultTitle);
    setIsPublic(defaultIsPublic);
  };

  const bookmark = api.bookmark.isBookmarked.useQuery(cacheKey);
  setIsBookmarked(!!bookmark.data);

  return (
    <div className="flex items-center justify-between border-b bg-background p-2">
      <div className="flex space-x-2">
        <Button variant="ghost" onClick={onBack} disabled={disabled}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" onClick={onForward} disabled={disabled}>
          <ChevronRight />
        </Button>
        {disabled ? (
          <Button variant="ghost" onClick={onCancel}>
            <X />
          </Button>
        ) : (
          <Button variant="ghost" onClick={onRefresh} disabled={disabled}>
            <RotateCw />
          </Button>
        )}
        <Button variant="ghost" onClick={onGoHome} disabled={disabled}>
          <Home />
        </Button>
        <ThemeToggle />
        <Button variant="ghost" onClick={() => signOut()}>
          <LogOut />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">
              {isBookmarked ? <BookmarkCheck /> : <Bookmark />}
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
              <Button onClick={handleAddBookmark}>Add Bookmark</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" onClick={onOpenHistory}>
          <Clock />
        </Button>
      </div>
    </div>
  );
};

export default BottomBar;
