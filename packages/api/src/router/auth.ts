import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../trpc";
import { and, eq, schema } from "@acme/db";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  getUserMetadata: protectedProcedure
  .input(z.string().min(1))
  .query(({ ctx, input }) => {
    return ctx.db.query.users.findFirst({
      where: and(eq(schema.users.id, input), eq(schema.users.isPublic, true)),
    });
  }),
  getOwnMetadata: protectedProcedure
  .query(({ ctx }) => {
    return ctx.db.query.users.findFirst({
      where: eq(schema.users.id, ctx.session.user.id),
    });
  }),
} satisfies TRPCRouterRecord;
