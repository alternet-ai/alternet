import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { Button } from "@acme/ui/button";
import { Dialog, DialogContent } from "@acme/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";
import { toast } from "@acme/ui/toast";

import type { User } from "../types";
import { api } from "~/trpc/react";
import Bookmarks from "./bookmarks";
import Following from "./following";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: User;
}

const ProfileDialog = ({ open, onClose, profileData }: ProfileDialogProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: session } = useSession();
  const utils = api.useUtils();

  const followingResult = api.following.isFollowingUser.useQuery(profileData.id).data;
  useEffect(() => {
    setIsFollowing(!!followingResult);
  }, [followingResult]);

  const followUser = api.following.insert.useMutation({
    onSuccess: async () => {
      await utils.following.invalidate();
      toast.success("Followed");
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to follow"
          : "Failed to follow",
      );
    },
  });

  const unFollowUser = api.following.delete.useMutation({
    onSuccess: async () => {
      await utils.following.invalidate();
      toast.success("Unfollowed");
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to unfollow"
          : "Failed to unfollow",
      );
    },
  });

  const isOwnProfile = session?.user.id === profileData.id;

  const handleFollowClick = () => {
    if (isFollowing) {
      unFollowUser.mutate(profileData.id);
      setIsFollowing(false);
    } else {
      followUser.mutate(profileData.id);
      setIsFollowing(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col space-y-8">
          <div className="h-full flex-1">
            <div className="flex items-center justify-center">
              <Image
                src={profileData.image ?? ""}
                alt="User Avatar"
                width={200}
                height={200}
                className="rounded-full ring-2 ring-ring ring-offset-4 ring-offset-background"
              />
            </div>
            <div className="mt-6 space-y-2 text-center">
              <p className="text-3xl font-semibold">{profileData.name}</p>
              <p className="text-xl text-muted-foreground">
                {profileData.description}
              </p>
            </div>
            {!isOwnProfile && (
              <div className="mt-6 flex justify-center">
                <Button onClick={handleFollowClick}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            )}
          </div>
          <Tabs defaultValue="bookmarks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="bookmarks"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Bookmarks
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Following
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bookmarks" className="p-4">
              <Bookmarks profileid={profileData.id} />
            </TabsContent>
            <TabsContent value="following" className="p-4">
              <Following profileid={profileData.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
