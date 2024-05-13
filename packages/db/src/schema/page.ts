import { sql } from "drizzle-orm";
import { text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

export const page = mySqlTable("page", {
  title: varchar("title", { length: 255 }).notNull(),
  fakeUrl: varchar("fakeUrl", { length: 255 }).notNull(),
  prompt: varchar("prompt", { length: 255 }).notNull(),
  content: text("content").notNull(),
  id: varchar("id", { length: 255 }).primaryKey(),
  response: text("response").notNull(),
  parentId: varchar("parentId", { length: 255 }).notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    fsp: 3,
  })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
});
