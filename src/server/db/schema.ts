import { sql, type SQL } from "drizzle-orm";
import { char, json, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

export const packages = pgTable(
  "packages",
  {
    name: varchar().notNull(),
    pname: varchar()
      .notNull()
      .generatedAlwaysAs((): SQL => sql`${packages.nix}->>'pname'`),
    version: varchar()
      .notNull()
      .generatedAlwaysAs((): SQL => sql`${packages.nix}->>'version'`),
    nix: json().notNull(),
    url: varchar().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  table => [primaryKey({ columns: [table.pname, table.version] })],
);

export const apiKeys = pgTable("api_keys", {
  salt: varchar().primaryKey(),
  hash: varchar().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const archives = pgTable("archives", {
  archive: json().notNull(),
  sha256: char({ length: 64 })
    .notNull()
    .generatedAlwaysAs((): SQL => sql`encode(digest(${archives.archive}::text, 'sha256'), 'hex')`)
    .primaryKey(),
  createdAt: timestamp().defaultNow().notNull(),
});
