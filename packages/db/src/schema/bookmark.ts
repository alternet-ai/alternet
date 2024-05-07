import { boolean, primaryKey, timestamp, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";
import { sql } from "drizzle-orm";

export const bookmarks = mySqlTable(
    "bookmark",
    {
      userId: varchar("userId", { length: 255 }).notNull(),
      bookmarkId: varchar("bookmarkId", { length: 255 }).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      isPublic: boolean("isPublic").default(false),
      updatedAt: timestamp("updatedAt", {
        mode: "date",
        fsp: 3,
      }).default(sql`CURRENT_TIMESTAMP(3)`).notNull(),
    },
    (bookmark) => ({
      compoundKey: primaryKey({
        columns: [bookmark.userId, bookmark.bookmarkId],
      }),
    }),
  );
  