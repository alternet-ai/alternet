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

  let allowDelete = false;
  const { data: session } = useSession();
  if (session) {
    const userid = session.user.id;
    allowDelete = userid === profileid;
  }

      
  let following = api.following.followingUser.useQuery(profileid).data;
  if (following === undefined) {
    following = [];
  }

  if (following.length === 0) {
    return <div className="mt-8">not following anyone yet :(</div>;
  }

  const deleteFollowing = api.following.delete.useMutation({
    onSuccess: async () => {
      await utils.following.invalidate();
      toast.success("Unfollowed");
    },
    onError: (err) => {
      toast.error("Failed to unfollow: " + err.message);
    },
  });


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
            {allowDelete && (
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
