import React from "react";
import Image from "next/image";

import { Dialog, DialogContent } from "@acme/ui/dialog";

import type { User } from "../types";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: User;
}

const ProfileDialog = ({ open, onClose, profileData }: ProfileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col space-y-6">
          <div className="h-full flex-1">
            <div className="flex items-center justify-center">
              <Image
                src={profileData.image ?? ""}
                alt="User Avatar"
                width={150}
                height={150}
                className="rounded-full ring-2 ring-ring ring-offset-4 ring-offset-background"
              />
            </div>
            <div className="mt-4 space-y-1 text-center">
              <p className="text-2xl font-semibold">{profileData.name}</p>
              <p className="text-muted-foreground">{profileData.description}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
