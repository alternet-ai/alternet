import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { connectionStr } from "./config";
import * as auth from "./schema/auth";
import * as bookmark from "./schema/bookmark";
import * as following from "./schema/following";
import * as feedback from "./schema/feedback";
import * as pageView from "./schema/pageView";

export * from "drizzle-orm/sql";
export { alias } from "drizzle-orm/mysql-core";

export const schema = { ...auth, ...bookmark, ...following, ...feedback, ...pageView };

const psClient = new Client({ url: connectionStr.href });
export const db = drizzle(psClient, { schema });
