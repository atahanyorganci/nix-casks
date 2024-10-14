import { sql } from "drizzle-orm";
import { primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createDatabase } from "~/db";

export const caskPackages = sqliteTable(
  "cask_packages",
  {
    pname: text("pname").notNull(),
    version: text("version").notNull(),
    hash: text("hash").notNull(),
    cask: text("cask", { mode: "json" }).notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
  },
  table => {
    return {
      pk: primaryKey({ columns: [table.pname, table.version] }),
      hashIndex: uniqueIndex("hash_index").on(table.hash),
    };
  },
);

export const apiKeys = sqliteTable("api_keys", {
  salt: text("salt").primaryKey(),
  keyHash: text("key").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`),
});
