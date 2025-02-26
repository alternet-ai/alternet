import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, eq, schema } from "@acme/db";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),

  getUserMetadata: publicProcedure
    .input(z.string().min(1))
    .mutation(({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: and(eq(schema.users.id, input), eq(schema.users.isPublic, true)),
      });
    }),

  getOwnMetadata: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.users.findFirst({
      where: eq(schema.users.id, ctx.session.user.id),
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        isPublic: z.boolean(),
        image: z.string().min(1),
        isBookmarkDefaultPublic: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(schema.users)
        .set({
          ...input,
        })
        .where(eq(schema.users.id, ctx.session.user.id));
    }),
} satisfies TRPCRouterRecord;
