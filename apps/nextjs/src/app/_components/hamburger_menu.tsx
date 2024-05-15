import React, { useEffect, useState } from "react";
import {
  Home,
  LogOut,
  Menu,
  UserCog,
  User as UserIcon,
  UserSearch,
} from "lucide-react";
import { signIn, signOut } from "next-auth/react";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { ThemeToggle } from "@acme/ui/theme";
import { toast } from "@acme/ui/toast";

import type { User } from "../types";
import { api } from "~/trpc/react";
import EditProfileDialog from "./edit_profile";
import ProfileDialog from "./profile";

interface HamburgerMenuProps {
  openToProfile: boolean;
  onGoHome: () => void;
  isHome: boolean;
  isLoading: boolean;
  creatorId: string;
  userMetadata: User | undefined;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  openToProfile,
  onGoHome,
  isHome,
  isLoading,
  creatorId,
  userMetadata,
}) => {
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(openToProfile);
  const [profileData, setProfileData] = useState<User | undefined>(undefined); //todo: set profile data after logging in

  const utils = api.useUtils();

  const getProfile = api.auth.getUserMetadata.useMutation({
    onSuccess: async (res) => {
      await utils.auth.invalidate();
      setProfileData(res);
    },
    onError: (err) => {
      toast.error("Failed to get profile: " + err.message);
    },
  });

  useEffect(() => {
    if (openToProfile && creatorId) {
      getProfile.mutate(creatorId);
    }
  }, [openToProfile, creatorId]);

  const toggleProfileDialog = () => {
    setIsProfileDialogOpen(!isProfileDialogOpen);
  };

  const showOwnProfile = () => {
    setProfileData(userMetadata);
    toggleProfileDialog();
  };

  const showProfile = () => {
    if (!creatorId) {
      toast.error("Creator not found");
    } else {
      getProfile.mutate(creatorId);
      toggleProfileDialog();
    }
  };

  const toggleEditProfileDialog = () => {
    setIsEditProfileDialogOpen(!isEditProfileDialogOpen);
  };

  return (
    <div>
      {userMetadata && (<EditProfileDialog
        open={isEditProfileDialogOpen}
        onClose={toggleEditProfileDialog}
      />)}
      {isProfileDialogOpen && profileData && (
        <ProfileDialog
          open={isProfileDialogOpen}
          onClose={toggleProfileDialog}
          profileData={profileData}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Menu className="size-[6vw] md:size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onGoHome} disabled={isLoading}>
            <Home className="mr-2 h-4 w-4" />
            <span>home</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={showProfile} disabled={isHome}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>page creator</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={showOwnProfile} disabled={!userMetadata}>
            <UserSearch className="mr-2 h-4 w-4" />
            <span>your profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={toggleEditProfileDialog}
            disabled={!userMetadata}
          >
            <UserCog className="mr-2 h-4 w-4" />
            <span>edit your profile</span>
          </DropdownMenuItem>
          <ThemeToggle />
          <DropdownMenuItem
            onClick={() => (userMetadata ? signOut() : signIn("discord"))}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{userMetadata ? "logout" : "login"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HamburgerMenu;
