import React from "react";
import {
  Bookmark,
  LogOut,
  Menu,
  User,
  UserCog,
  UserSearch,
} from "lucide-react";
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
  onViewYourProfile: () => void;
  isHome: boolean;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onEditProfile,
  onViewProfile,
  onViewYourProfile,
  isHome,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Menu className="size-[5vw] md:size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Bookmark className="mr-2 h-4 w-4" />
          <span>bookmarks</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewProfile} disabled={isHome}>
          <User className="mr-2 h-4 w-4" />
          <span>page creator</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewYourProfile}>
          <UserSearch className="mr-2 h-4 w-4" />
          <span>your profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditProfile}>
          <UserCog className="mr-2 h-4 w-4" />
          <span>edit your profile</span>
        </DropdownMenuItem>
        <ThemeToggle />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HamburgerMenu;
