import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, schema } from "@acme/db";

import { protectedProcedure, publicProcedure } from "../trpc";

export const followingRouter = {
  followingUser: publicProcedure
  .input(z.string().min(1))
  .query(({ ctx, input }) => {
    return ctx.db
      .select({
        followingId: schema.following.followingId,
        name: schema.users.name,
        image: schema.users.image,
      })
      .from(schema.following)
      .where(eq(schema.following.userId, input))
      .innerJoin(schema.users, eq(schema.following.followingId, schema.users.id));
  }),

  isFollowingUser: protectedProcedure
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
