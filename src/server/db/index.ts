import type { Logger } from "drizzle-orm";
import { drizzle } from "drizzle-orm/vercel-postgres";
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
		schema,
		logger: new DrizzleLogger(),
	});
}

export type Database = ReturnType<typeof createDatabase>;
