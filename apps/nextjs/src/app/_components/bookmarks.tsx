import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";

import { Switch } from "@acme/ui/switch";
import { toast } from "@acme/ui/toast";

import { env } from "~/env";
import { api } from "~/trpc/react";

interface Bookmark {
  userId: string;
  isPublic: boolean | null;
  bookmarkId: string;
  title: string;
  updatedAt: Date;
}

interface BookmarksProps {
  profileid: string;
}

const Bookmarks = ({ profileid }: BookmarksProps) => {
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

  const deleteBookmark = api.bookmark.delete.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
      toast.success("Bookmark deleted");
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to delete a bookmark"
          : "Failed to delete bookmark",
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

  const isOwnProfile = userid === profileid;
  let bookmarks: Bookmark[] | undefined;
  if (isOwnProfile) {
    bookmarks = api.bookmark.mine.useQuery().data;
  } else {
    bookmarks = api.bookmark.yours.useQuery(profileid).data;
  }

  if (bookmarks === undefined) {
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

    const handleTitleKeyDown = (
      event: KeyboardEvent,
      bookmarkId: string,
      title: string,
    ) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleTitleBlur(bookmarkId, title);
      }
    };

    Object.entries(currentTitleRefs).forEach(([bookmarkId, ref]) => {
      ref?.addEventListener("blur", () =>
        handleTitleBlur(bookmarkId, ref.textContent ?? ""),
      );
      ref?.addEventListener("keydown", (event) =>
        handleTitleKeyDown(event, bookmarkId, ref.textContent ?? ""),
      );
    });

    return () => {
      Object.entries(currentTitleRefs).forEach(([bookmarkId, ref]) => {
        ref?.removeEventListener("blur", () =>
          handleTitleBlur(bookmarkId, ref.textContent ?? ""),
        );
        ref?.removeEventListener("keydown", (event) =>
          handleTitleKeyDown(event, bookmarkId, ref.textContent ?? ""),
        );
      });
    };
  }, [bookmarks, handleUpdate]);

  if (bookmarks.length === 0) {
    return <div className="mt-8">no bookmarks yet :(</div>;
  }

  return (
    <div className="mt-8">
      <div className="grid max-h-96 grid-cols-2 gap-10 overflow-y-auto">
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
              <div className="mt-2 flex items-center justify-around">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">public:</span>

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
                <button
                  onClick={() => deleteBookmark.mutate(bookmark.bookmarkId)}
                  className="text-red-500 hover:text-red-600 focus:outline-none"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
