import React, { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Dialog, DialogContent } from "@acme/ui/dialog";
import { Switch } from "@acme/ui/switch";
import { toast } from "@acme/ui/toast";

import type { User } from "../types";
import { env } from "~/env";
import { api } from "~/trpc/react";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: User;
}

interface Bookmark {
  userId: string;
  isPublic: boolean | null;
  bookmarkId: string;
  title: string;
  updatedAt: Date;
}

const ProfileDialog = ({ open, onClose, profileData }: ProfileDialogProps) => {
  const utils = api.useUtils();

  const updateBookmark = api.bookmark.update.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
      toast.success("Bookmark updated");
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update a bookmark"
          : "Failed to update bookmark",
      );
    },
  });

  const { data: session } = useSession();
  if (!session) {
    throw new Error("No session found");
  }
  const userid = session.user.id;

  const titleRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  const handleUpdate = useCallback(
    (bookmarkId: string, title: string, isPublic: boolean) => {
      updateBookmark.mutate({ bookmarkId, title, isPublic });
    },
    [updateBookmark],
  );

  const isOwnProfile = userid === profileData.id;
  let bookmarks: Bookmark[] | undefined;
  if (isOwnProfile) {
    bookmarks = api.bookmark.mine.useQuery().data;
  } else {
    bookmarks = api.bookmark.yours.useQuery(profileData.id).data;
  }

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
  });

  useEffect(() => {
    const currentTitleRefs = titleRefs.current;

    const handleTitleBlur = (bookmarkId: string, title: string) => {
      if (title !== bookmarks.find((b) => b.bookmarkId === bookmarkId)?.title) {
        handleUpdate(
          bookmarkId,
          title,
          bookmarks.find((b) => b.bookmarkId === bookmarkId)?.isPublic ?? false,
        );
      }
    };

    Object.entries(currentTitleRefs).forEach(([bookmarkId, ref]) => {
      ref?.addEventListener("blur", () =>
        handleTitleBlur(bookmarkId, ref.textContent ?? ""),
      );
    });

    return () => {
      Object.entries(currentTitleRefs).forEach(([bookmarkId, ref]) => {
        ref?.removeEventListener("blur", () =>
          handleTitleBlur(bookmarkId, ref.textContent ?? ""),
        );
      });
    };
  }, [bookmarks, handleUpdate]);

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
              <div className="grid max-h-96 grid-cols-2 gap-6 overflow-y-auto">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.bookmarkId}>
                    <div className="flex flex-col items-center space-y-2">
                      <Link href={`https://alternet.ai/${bookmark.bookmarkId}`}>
                        <Image
                          src={`${env.NEXT_PUBLIC_SCREENSHOT_BUCKET_URL}/${bookmark.bookmarkId}.png`}
                          alt={bookmark.title}
                          width={250}
                          height={188}
                          className="rounded-md hover:ring-2 hover:ring-primary"
                        />
                      </Link>
                      <p
                        ref={(el) => {
                          titleRefs.current[bookmark.bookmarkId] = el;
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        className="text-center hover:text-primary focus:outline-none"
                      >
                        {bookmark.title}
                      </p>
                    </div>
                    {isOwnProfile && (
                      <div className="mt-2 flex items-center justify-center space-x-2">
                        <span className="text-sm">Public:</span>
                        <Switch
                          checked={bookmark.isPublic ?? false}
                          onCheckedChange={(isPublic) =>
                            handleUpdate(
                              bookmark.bookmarkId,
                              bookmark.title,
                              isPublic,
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
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
