import type { NODE_ENV } from "astro:env/server";
import type { Logger } from "winston";
import type { Database } from "../db";

export interface AppContext {
	Bindings: {
		db: Database;
		logger: Logger;
		NODE_ENV: typeof NODE_ENV;
		QSTASH_CURRENT_SIGNING_KEY: string;
		QSTASH_NEXT_SIGNING_KEY: string;
		QSTASH_TOKEN: string;
		QSTASH_URL: string;
		UPSTASH_WORKFLOW_URL: string;
	};
	Variables: object;
}
