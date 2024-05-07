import React from "react";
import Image from "next/image";

import { Dialog, DialogContent } from "@acme/ui/dialog";

import type { User } from "../types";
import { env } from "~/env";
import { api } from "~/trpc/react";
import Link from "next/link";
import { DEPLOYMENT_URL } from "../utils/url";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: User;
}

const ProfileDialog = ({ open, onClose, profileData }: ProfileDialogProps) => {
  let bookmarks = api.bookmark.yours.useQuery(profileData.id).data;

  if (bookmarks === undefined) {
    console.error("Bookmarks not found");
    bookmarks = [];
  }

  bookmarks.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  //confirm all the images are ready
    bookmarks.map((bookmark) => {
      fetch(`/api/get-card-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookmarkId: bookmark.bookmarkId }),
      }).catch((err) => {
        console.error(err);
      });
    })

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
          {bookmarks.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-6 text-2xl font-semibold">Public Bookmarks</h3>
              <div className="grid max-h-96 grid-cols-2 gap-6 overflow-y-auto">
                {bookmarks.map((bookmark) => (
                  <Link
                    key={bookmark.bookmarkId}
                    href={`https://alternet.ai/${bookmark.bookmarkId}`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Image
                        src={`${env.NEXT_PUBLIC_SCREENSHOT_BUCKET_URL}/${bookmark.bookmarkId}.png`}
                        alt={bookmark.title}
                        width={250}
                        height={188}
                        className="rounded-md hover:ring-2 hover:ring-primary"
                      />
                      <p className="text-center hover:text-primary">
                        {bookmark.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ProfileDialog;
