import Image from "next/image";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";
import { Textarea } from "@acme/ui/textarea";

import { api } from "~/trpc/react";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProfileDialog = ({ open, onClose }: ProfileDialogProps) => {
  //TODO: what happens if you're not logged in?
  const userData = api.auth.getOwnMetadata.useQuery().data;

  if (!userData) {
    return <div>Loading...</div>;
  }

  async function handleSubmit(formData: FormData) {
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      isPublic: formData.get("isPublic") === "on",
      image: formData.get("image") as string,
    };
    // TODO: Implement database update
    // Async do-nothing function
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.log("Updated profile:", data);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: Implement avatar upload
    // Async do-nothing function
    await new Promise((resolve) => setTimeout(resolve, 0));
    console.log("Uploaded avatar:", file);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Image
              src={userData.image ?? ""}
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={userData.name ?? ""} />
          </div>
          <div className="grid w-full items-center gap-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              defaultValue={userData.email}
              disabled
            />
          </div>
          <div className="grid w-full items-center gap-4">
            <Label htmlFor="description">Description</Label>
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
            <Label htmlFor="isPublic">Public</Label>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
