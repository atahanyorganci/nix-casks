import type { Logger } from "drizzle-orm";
import { neon, neonConfig } from "@neondatabase/serverless";
import { DATABASE_URL } from "astro:env/server";
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
	neonConfig.fetchEndpoint = host => `https://${host}/sql`;
	return drizzle({
		client: neon(DATABASE_URL),
		schema,
		logger: new DrizzleLogger(),
	});
}

export type Database = ReturnType<typeof createDatabase>;
