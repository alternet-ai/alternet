import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, schema, sql } from "@acme/db";
import { CreateBookmarkSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const bookmarkRouter = {
  // following: protectedProcedure
  //   .query(({ ctx }) => {
  //     return ctx.db
  //       .select()
  //       .from(schema.following)
  //       .where(eq(schema.following.userId, ctx.session.user.id))
  //       .innerJoin(
  //         schema.bookmarks,
  //         and(
  //           eq(schema.following.followingId, schema.bookmarks.userId),
  //           eq(schema.bookmarks.isPublic, true),
  //         ),
  //       )
  //       .orderBy(desc(schema.bookmarks.updatedAt))
  //       .limit(10);
  //   }),

  mine: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.bookmarks.findMany({
      where: eq(schema.bookmarks.userId, ctx.session.user.id),
    });
  }),

  yours: publicProcedure.input(z.string().min(1)).query(({ ctx, input }) => {
    return ctx.db.query.bookmarks.findMany({
      where: and(
        eq(schema.bookmarks.userId, input),
        eq(schema.bookmarks.isPublic, true),
      ),
    });
  }),

  update: protectedProcedure
    .input(CreateBookmarkSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(schema.bookmarks)
        .set({
          title: input.title,
          isPublic: input.isPublic,
          updatedAt: sql`CURRENT_TIMESTAMP(3)`,
        })
        .where(eq(schema.bookmarks.bookmarkId, input.bookmarkId));
    }),

  insert: protectedProcedure
    .input(CreateBookmarkSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(schema.bookmarks).values({
        ...input,
        userId: ctx.session.user.id,
        updatedAt: sql`CURRENT_TIMESTAMP(3)`,
      });
    }),

  delete: protectedProcedure
    .input(z.string().min(1))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .delete(schema.bookmarks)
        .where(
          and(
            eq(schema.bookmarks.bookmarkId, input),
            eq(schema.bookmarks.userId, ctx.session.user.id),
          ),
        );
    }),

  isBookmarked: protectedProcedure
    .input(z.string().min(1))
    .mutation(({ ctx, input }) => {
      return ctx.db.query.bookmarks.findFirst({
        where: and(
          eq(schema.bookmarks.userId, ctx.session.user.id),
          eq(schema.bookmarks.bookmarkId, input),
        ),
      });
    }),
} satisfies TRPCRouterRecord;
