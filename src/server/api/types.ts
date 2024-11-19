import type { NODE_ENV } from "astro:env/server";
import type { Logger } from "winston";
import type { Database } from "../db";

export interface AppContext {
	Bindings: {
		db: Database;
		logger: Logger;
		NODE_ENV: typeof NODE_ENV;
	};
}
