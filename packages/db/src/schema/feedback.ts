import { sql } from "drizzle-orm";
import { primaryKey, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { mySqlTable } from "./_table";

export const feedback = mySqlTable(
  "feedback",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    pageId: varchar("pageId", { length: 255 }).notNull(),
    submittedAt: timestamp("submittedAt", {
      mode: "date",
      fsp: 3,
    })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    feedback: text("feedback").notNull(),
  },
  (feedback) => ({
    compoundKey: primaryKey({
      columns: [feedback.submittedAt, feedback.userId],
    }),
  }),
);
