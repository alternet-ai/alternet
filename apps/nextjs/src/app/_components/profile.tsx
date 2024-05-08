import Image from "next/image";

import { Dialog, DialogContent } from "@acme/ui/dialog";

import type { User } from "../types";

import Bookmarks from "./bookmarks";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: User;
}

const ProfileDialog = ({ open, onClose, profileData }: ProfileDialogProps) => {
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
          </div>
          <Bookmarks profileData={profileData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
