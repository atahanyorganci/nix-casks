import type { Logger } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { POSTGRES_URL } from "astro:env/server";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { createLogger } from "../logger";
import * as schema from "./schema";

export * from "./schema";

class DrizzleLogger implements Logger {
	private readonly logger = createLogger();

	logQuery(query: string, params: unknown[]): void {
		this.logger.info("Executing query", { query, params });
	}
}

export function createNeonHttp() {
	return drizzleNeonHttp({
		client: neon(POSTGRES_URL),
		schema,
		logger: new DrizzleLogger(),
	});
}

export type Database = ReturnType<typeof createNeonHttp>;
