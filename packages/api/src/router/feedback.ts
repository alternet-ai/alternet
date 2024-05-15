import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { schema } from "@acme/db";

import { publicProcedure } from "../trpc";

export const feedbackRouter = {
  submit: publicProcedure
  .input(z.object({
    pageId: z.string().min(1),
    feedback: z.string().min(1),
  }))
  .mutation(({ ctx, input }) => {
    return ctx.db
      .insert(schema.feedback)
      .values({
        userId: ctx.session?.user.id ?? "",
        pageId: input.pageId,
        feedback: input.feedback,
      })
  }),
} satisfies TRPCRouterRecord;
