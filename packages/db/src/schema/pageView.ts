import { sql } from "drizzle-orm";
import { primaryKey, timestamp, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

export const pageView = mySqlTable(
  "pageView",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    pageId: varchar("pageId", { length: 255 }).notNull(),
    viewTime: timestamp("viewTime", {
      mode: "date",
      fsp: 3,
    })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (pageView) => ({
    compoundKey: primaryKey({
      columns: [pageView.viewTime, pageView.userId],
    }),
  }),
);
