import { authRouter } from "./router/auth";
import { bookmarkRouter } from "./router/bookmark";
import { followingRouter } from "./router/following";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  bookmark: bookmarkRouter,
  following: followingRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
