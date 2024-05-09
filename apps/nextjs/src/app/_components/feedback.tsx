import React, { useState } from "react";
import { Bug } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

const FeedbackButton: React.FC<{ pageId: string }> = ({ pageId }) => {
  const [open, setOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const utils = api.useUtils();

  const submitFeedback = api.feedback.submit.useMutation({
    onSuccess: async () => {
      await utils.feedback.invalidate();
      toast.success("Feedback submitted successfully!");
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to submit feedback"
          : "Failed to submit feedback",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      submitFeedback.mutate({
        pageId: pageId,
        feedback: feedbackText,
      });
      setFeedbackText("");
      setOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Bug className="size-[4.5vw] md:size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>talk to us</DialogTitle>
          <DialogDescription>
            thoughts? feelings? opinions? BUGS?!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="col-span-4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;
