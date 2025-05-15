import type { SQL } from "drizzle-orm";
import type { z } from "zod";
import { sql } from "drizzle-orm";
import { char, customType, integer, json, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

const semver = customType<{ data: string }>({
	dataType() {
		return "semver";
	},
});

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
		semver: semver().generatedAlwaysAs((): SQL => sql`try_cast_to_semver(${packages.nix}->>'version')`),
		description: varchar()
			.generatedAlwaysAs((): SQL => sql`${packages.nix}->'meta'->>'description'`),
		homepage: varchar()
			.generatedAlwaysAs((): SQL => sql`${packages.nix}->'meta'->>'homepage'`),
		generatorVersion: integer().default(1).notNull(),
		nix: json().notNull(),
		url: varchar().notNull(),
		createdAt: timestamp().defaultNow().notNull(),
	},
	table => [primaryKey({ columns: [table.generatorVersion, table.pname, table.version] })],
);

export const insertPackageSchema = createInsertSchema(packages);
export type InsertPackage = z.infer<typeof insertPackageSchema>;

export const archives = pgTable("archives", {
	archive: json().notNull(),
	sha256: char({ length: 64 })
		.notNull()
		.generatedAlwaysAs((): SQL => sql`encode(digest(${archives.archive}::text, 'sha256'), 'hex')`)
		.primaryKey(),
	createdAt: timestamp().defaultNow().notNull(),
});
