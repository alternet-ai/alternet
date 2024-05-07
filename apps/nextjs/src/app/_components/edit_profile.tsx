import { useState } from "react";
import Image from "next/image";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import { env } from "~/env";
import { api } from "~/trpc/react";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const EditProfileDialog = ({ open, onClose }: EditProfileDialogProps) => {
  const utils = api.useUtils();
  const [imageUrl, setImageUrl] = useState<string>(""); // Initialize state for image URL

  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.auth.invalidate();
      toast.success("Profile updated successfully");
      onClose();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update your profile"
          : "Failed to update profile",
      );
    },
  });

  //TODO: what happens if you're not logged in?
  const userData = api.auth.getOwnMetadata.useQuery().data;

  if (!userData) {
    return <div>Loading...</div>;
  }

  function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      isPublic: formData.get("isPublic") === "on",
      image: imageUrl || formData.get("image") as string || (userData?.image?? ""),
      isBookmarkDefaultPublic: formData.get("bookmarksDefaultPublic") === "on",
    };

    updateProfile.mutate(data);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type; // This will give you the MIME type, e.g., 'image/jpeg'

    // Assuming you're sending the file as FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType); // Send MIME type to the backend

    const response = await fetch(
      `${env.NEXT_PUBLIC_VERCEL_URL}/api/save-avatar`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (response.ok) {
      const responseData = (await response.json()) as { url: string }; // Parse the JSON response
      setImageUrl(responseData.url); // Update the image URL state
    } else {
      toast.error("Failed to upload avatar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>

        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Image
              src={(imageUrl || userData.image) ?? ""}
              alt="User Avatar"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <div className="w-60">
            <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          <div className="grid w-full items-center gap-4">
            <Label htmlFor="name">name</Label>
            <Input id="name" name="name" defaultValue={userData.name ?? ""} />
          </div>
          <div className="grid w-full items-center gap-4">
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              name="email"
              defaultValue={userData.email}
              disabled
            />
          </div>
          <div className="grid w-full items-center gap-4">
            <Label htmlFor="description">about</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={userData.description ?? ""}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              name="isPublic"
              defaultChecked={userData.isPublic ?? false}
            />
            <Label htmlFor="isPublic">public profile</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="bookmarksDefaultPublic"
              name="bookmarksDefaultPublic"
              defaultChecked={userData.isBookmarkDefaultPublic ?? false}
            />
            <Label htmlFor="bookmarksDefaultPublic">
              bookmarks default to public
            </Label>
          </div>
          <Button type="submit">save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
