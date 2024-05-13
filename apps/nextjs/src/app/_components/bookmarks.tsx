import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Trash } from "lucide-react";

import { Switch } from "@acme/ui/switch";
import { toast } from "@acme/ui/toast";

import { env } from "~/env";
import { createCallerFactory } from "@acme/api/trpc";

interface Bookmark {
  userId: string;
  isPublic: boolean | null;
  bookmarkId: string;
  title: string;
  updatedAt: Date;
}

interface BookmarksProps {
  profileid: string;
  session: Session;
  bookmarks: Bookmark[];
}

const Bookmarks = ({ profileid, session, bookmarks }: BookmarksProps) => {
  const caller = createCallerFactory({ headers: new Headers() });

  const updateBookmark = async (bookmarkId: string, isPublic: boolean) => {
    try {
      await caller.bookmark.update({ bookmarkId, isPublic });
      toast.success("Bookmark updated");
    } catch (err) {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update a bookmark"
          : "Failed to update bookmark",
      );
    }
  };

  const deleteBookmark = async (bookmarkId: string) => {
    try {
      await caller.bookmark.delete(bookmarkId);
      toast.success("Bookmark deleted");
    } catch (err) {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to delete a bookmark"
          : "Failed to delete bookmark",
      );
    }
  };

  const userid = session.user.id;
  const isOwnProfile = userid === profileid;

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
              <p className="text-center">
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
                      updateBookmark(bookmark.bookmarkId, isPublic)
                    }
                  />
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.bookmarkId)}
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
