import { authRouter } from "./router/auth";
import { bookmarkRouter } from "./router/bookmark";
import { followingRouter } from "./router/following";
import { feedbackRouter } from "./router/feedback";
import { pageViewRouter } from "./router/pageView";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  bookmark: bookmarkRouter,
  following: followingRouter,
  feedback: feedbackRouter,
  pageView: pageViewRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
