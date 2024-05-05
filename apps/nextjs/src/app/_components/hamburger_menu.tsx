import React from "react";
import { Bookmark, LogOut, Menu, User } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@acme/ui/button";
import { DialogTrigger } from "@acme/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { ThemeToggle } from "@acme/ui/theme";
import ProfileDialog from "./edit_profile";

const HamburgerMenu: React.FC = () => {
  return (
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
          <ProfileDialog>
            <DialogTrigger asChild>
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </div>
            </DialogTrigger>
          </ProfileDialog>
        </DropdownMenuItem>
        <ThemeToggle />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HamburgerMenu;
