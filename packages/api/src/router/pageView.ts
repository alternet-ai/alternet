import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { schema } from "@acme/db";

import { protectedProcedure } from "../trpc";

export const pageViewRouter = {
  view: protectedProcedure
    .input(z.string().min(1))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.pageView).values({
        userId: ctx.session.user.id,
        pageId: input,
      });
    }),
} satisfies TRPCRouterRecord;
