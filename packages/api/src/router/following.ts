import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, schema } from "@acme/db";

import { protectedProcedure } from "../trpc";

export const followingRouter = {
  following: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.following.findMany({
      where: eq(schema.following.userId, ctx.session.user.id),
    });
  }),

  followingUser: protectedProcedure
    .input(z.string().min(1))
    .query(({ ctx, input }) => {
      return ctx.db.query.following.findFirst({
        where: and(
          eq(schema.following.userId, ctx.session.user.id),
          eq(schema.following.followingId, input),
        ),
      });
    }),

  insert: protectedProcedure
    .input(z.string().min(1))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.following).values({
        followingId: input,
        userId: ctx.session.user.id,
      });
    }),

  delete: protectedProcedure
    .input(z.string().min(1))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .delete(schema.following)
        .where(
          and(
            eq(schema.following.followingId, input),
            eq(schema.following.userId, ctx.session.user.id),
          ),
        );
    }),
} satisfies TRPCRouterRecord;
