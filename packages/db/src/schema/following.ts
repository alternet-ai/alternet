import { varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

export const following = mySqlTable("following", {
  userId: varchar("userId", { length: 255 }).primaryKey(),
  followingId: varchar("followingId", { length: 255 }).notNull(),
});
