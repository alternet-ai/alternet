import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { schema } from "@acme/db";

import { protectedProcedure } from "../trpc";


export const pageRouter = {
  add: protectedProcedure
  .input(z.object({
      title: z.string().min(1),
      fakeUrl: z.string().min(1),
      prompt: z.string().min(1),
      content: z.string().min(1),
      id: z.string().min(1),
      response: z.string().min(1),
      parentId: z.string().min(1),
  }))
  .mutation(({ ctx, input }) => {
    return ctx.db
      .insert(schema.page)
      .values({
        userId: ctx.session.user.id,
        title: input.title,
        id: input.id,
        fakeUrl: input.fakeUrl,
        prompt: input.prompt,
        content: input.content,
        response: input.response,
        parentId: input.parentId,
      })
  }),
} satisfies TRPCRouterRecord;
