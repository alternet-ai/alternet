import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, schema } from "@acme/db";

import { protectedProcedure, publicProcedure } from "../trpc";


export const pageRouter = {
  save: protectedProcedure
  .input(z.object({
      title: z.string().min(1),
      fakeUrl: z.string().min(1),
      prompt: z.string().min(1),
      content: z.string().min(1),
      id: z.string().min(1),
      response: z.string().min(0),
      parentId: z.string().min(0),
      model: z.string().min(1),
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
        model: input.model,
      })
  }),

  load: publicProcedure
  .input(z.string().min(1))
  .mutation(({ ctx, input }) => {
    return ctx.db.query.page.findFirst({
      where: eq(schema.page.id, input),
    });
  }),


  // saveAsUser: protectedProcedure
  // .input(z.object({
  //     title: z.string().min(1),
  //     fakeUrl: z.string().min(1),
  //     prompt: z.string().min(1),
  //     content: z.string().min(1),
  //     id: z.string().min(1),
  //     response: z.string().min(1),
  //     parentId: z.string().min(1),
  //     userId: z.string().min(1),
  // }))
  // .mutation(({ ctx, input }) => {
  //   return ctx.db
  //     .insert(schema.page)
  //     .values({
  //       userId: input.userId,
  //       title: input.title,
  //       id: input.id,
  //       fakeUrl: input.fakeUrl,
  //       prompt: input.prompt,
  //       content: input.content,
  //       response: input.response,
  //       parentId: input.parentId,
  //     })
  // }),

  // loadAll: publicProcedure
  // .mutation(({ ctx }) => {
  //   return ctx.db.select({id: schema.page.id}).from(schema.page);
  // }),
} satisfies TRPCRouterRecord;
