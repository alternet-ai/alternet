import { useCallback, useEffect, useRef, useState } from "react";
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
  const baseUrl =
    env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://alternet.ai";
  const utils = api.useUtils();

  const { data: session } = useSession();

  const titleRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const getMyBookmarks = api.bookmark.mine.useMutation();
  const getYourBookmarks = api.bookmark.yours.useMutation();

  useEffect(() => {
    if (session) {
      const userid = session.user.id;
      setIsOwnProfile(userid === profileid);
    }
  }, [session, profileid]);

  useEffect(() => {
    const fetchBookmarks = (fetchedBookmarks: Bookmark[]) => {
      fetchedBookmarks.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
      setBookmarks(fetchedBookmarks);
    };

    const getBookmarks = async () => {
      if (isOwnProfile) {
        const res = await getMyBookmarks.mutateAsync();
        fetchBookmarks(res);
      } else {
        const res = await getYourBookmarks.mutateAsync(profileid);
        fetchBookmarks(res);
      }
    };

    void getBookmarks();
  }, [isOwnProfile, profileid]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      await Promise.all(
        bookmarks.map(async (bookmark) => {
          try {
            const response = await fetch(`/api/get-card-image`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: bookmark.bookmarkId }),
            });
            const data = (await response.json()) as { imageUrl: string };
            urls[bookmark.bookmarkId] = data.imageUrl;
          } catch (err) {
            console.error(err);
          }
        }),
      );
      setImageUrls(urls);
    };

    void fetchImageUrls();
  }, [bookmarks]);

  const updateBookmark = api.bookmark.update.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
      toast.success("Bookmark updated");
    },
    onError: (err) => {
      toast.error("Failed to update bookmark: " + err.message);
    },
  });

  const deleteBookmark = api.bookmark.delete.useMutation({
    onSuccess: async () => {
      await utils.bookmark.invalidate();
      toast.success("Bookmark deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete bookmark: " + err.message);
    },
  });

  const handleUpdate = useCallback(
    (bookmarkId: string, title: string, isPublic: boolean) => {
      updateBookmark.mutate({ bookmarkId, title, isPublic });
    },
    [updateBookmark],
  );

  useEffect(() => {
    const handleTitleBlur = (event: FocusEvent) => {
      const target = event.target as HTMLParagraphElement;
      const bookmarkId = target.dataset.bookmarkId;
      if (!bookmarkId) return;

      const title = target.textContent ?? "";
      if (title !== bookmarks.find((b) => b.bookmarkId === bookmarkId)?.title) {
        handleUpdate(
          bookmarkId,
          title,
          bookmarks.find((b) => b.bookmarkId === bookmarkId)?.isPublic ?? false,
        );
      }
    };

    const handleTitleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLParagraphElement;
      const bookmarkId = target.dataset.bookmarkId;
      if (!bookmarkId) return;

      if (event.key === "Enter") {
        event.preventDefault();
        handleTitleBlur(event as unknown as FocusEvent);
      }
    };

    const container = document.getElementById("bookmarks-container");
    container?.addEventListener("blur", handleTitleBlur, true);
    container?.addEventListener("keydown", handleTitleKeyDown, true);

    return () => {
      container?.removeEventListener("blur", handleTitleBlur, true);
      container?.removeEventListener("keydown", handleTitleKeyDown, true);
    };
  }, [bookmarks, handleUpdate]);

  if (bookmarks.length === 0) {
    return <div className="mt-8">no bookmarks yet :(</div>;
  }

  return (
    <div id="bookmarks-container" className="mt-8">
      <div className="grid max-h-96 grid-cols-2 gap-10 overflow-y-auto">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.bookmarkId}>
            <div className="flex flex-col items-center space-y-2">
              <Link href={`${baseUrl}/${bookmark.bookmarkId}`}>
                <Image
                  src={imageUrls[bookmark.bookmarkId] ?? "/broken.png"}
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
                data-bookmark-id={bookmark.bookmarkId}
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
