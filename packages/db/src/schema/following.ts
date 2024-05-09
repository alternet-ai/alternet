import { primaryKey, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

export const following = mySqlTable(
  "following",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    followingId: varchar("followingId", { length: 255 }).notNull(),
  },
  (following) => ({
    compoundKey: primaryKey({
      columns: [following.userId, following.followingId],
    }),
  }),
);
