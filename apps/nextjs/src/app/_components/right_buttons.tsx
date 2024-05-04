import React, { useEffect, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@acme/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";
import { ThemeToggle } from "@acme/ui/theme";

interface RightButtonsProps {
  onAddBookmark: (title: string, isPublic: boolean) => void;
  onDeleteBookmark: () => void;
  onOpenHistory: () => void;
  defaultTitle: string;
  defaultIsPublic: boolean;
  isBookmarked: boolean;
}

const RightButtons: React.FC<RightButtonsProps> = ({
  onAddBookmark,
  onDeleteBookmark,
  onOpenHistory,
  defaultTitle,
  defaultIsPublic,
  isBookmarked,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [isPublic, setIsPublic] = useState(defaultIsPublic);

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Bookmarks</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <ThemeToggle />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
