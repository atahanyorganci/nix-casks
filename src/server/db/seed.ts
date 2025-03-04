/* eslint-disable no-console */

import type { Database } from "./index.ts";
import process from "node:process";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset } from "drizzle-seed";
import { updateHomebrewCasks } from "~/lib/package.ts";
import * as schema from "./schema.ts";

async function main() {
	const db = drizzle({
		connection: {
			connectionString: process.env.POSTGRES_URL!,
		},
	});
	await reset(db, schema);
	console.log("Database reset");
	const packages = await updateHomebrewCasks(db as unknown as Database);
	console.log(`Added ${packages.length} casks`);
	const [{ sha256 }] = await db.insert(schema.archives).values({ archive: packages }).returning();
	console.log(`Created archive with SHA256 ${sha256}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
