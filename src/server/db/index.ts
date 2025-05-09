import type { Logger } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { NEON_DATABASE_URL } from "astro:env/server";
import { drizzle } from "drizzle-orm/neon-http";
import { createLogger } from "../logger";
import * as schema from "./schema";

export * from "./schema";

class DrizzleLogger implements Logger {
	private readonly logger = createLogger();

	logQuery(query: string, params: unknown[]): void {
		this.logger.info("Executing query", { query, params });
	}
}

export function createDatabase() {
	return drizzle({
		client: neon(NEON_DATABASE_URL),
		schema,
		logger: new DrizzleLogger(),
	});
}

export type Database = ReturnType<typeof createDatabase>;
