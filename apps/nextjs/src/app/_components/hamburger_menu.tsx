import React from "react";
import { Bookmark, LogOut, Menu, User } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { ThemeToggle } from "@acme/ui/theme";

interface HamburgerMenuProps {
  onEditProfile: () => void;
  onViewProfile: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onEditProfile,
  onViewProfile,
}) => {
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
        <DropdownMenuItem onClick={onViewProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditProfile}>
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
  );
};

export default HamburgerMenu;
