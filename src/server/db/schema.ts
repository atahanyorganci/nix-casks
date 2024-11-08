import { sql, type SQL } from "drizzle-orm";
import { json, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

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
