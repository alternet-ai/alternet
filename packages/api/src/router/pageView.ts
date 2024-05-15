import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { schema } from "@acme/db";

import { publicProcedure } from "../trpc";

export const pageViewRouter = {
  view: publicProcedure
    .input(z.string().min(1))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.pageView).values({
        userId: ctx.session?.user.id ?? "anonymous",
        pageId: input,
      });
    }),
} satisfies TRPCRouterRecord;
