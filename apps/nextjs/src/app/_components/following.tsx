import Image from "next/image";
import { Trash } from "lucide-react";
import { useSession } from "next-auth/react";

import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface Following {
  followingId: string;
  name: string;
  image: string;
}

interface FollowingProps {
  profileid: string;
}

const Following = ({ profileid }: FollowingProps) => {
  const utils = api.useUtils();

  const deleteFollowing = api.following.delete.useMutation({
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

  const { data: session } = useSession();
  if (!session) {
    throw new Error("No session found");
  }
  const userid = session.user.id;

  const isOwnProfile = userid === profileid;
  let following = api.following.followingUser.useQuery(profileid).data;

  if (following === undefined) {
    console.error("Following not found");
    following = [];
  }

  if (following.length === 0) {
    return <div className="mt-8">not following anyone yet :(</div>;
  }

  return (
    <div className="mt-8">
      <div className="grid max-h-96 grid-cols-2 gap-10 overflow-y-auto">
        {following.map((follow) => (
          <div key={follow.followingId} className="flex items-center space-x-4">
            <Image
              src={follow.image ?? ""}
              alt={follow.name ?? ""}
              width={50}
              height={50}
              className="rounded-full"
            />
            <p>{follow.name}</p>
            {isOwnProfile && (
              <button
                onClick={() => deleteFollowing.mutate(follow.followingId)}
                className="text-red-500 hover:text-red-600 focus:outline-none"
              >
                <Trash className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Following;
