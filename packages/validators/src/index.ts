import { z } from "zod";

export const CreateBookmarkSchema = z.object({
  bookmarkId: z.string().min(1),
  title: z.string().min(1),
  isPublic: z.boolean(),
});
