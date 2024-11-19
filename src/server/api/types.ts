import type { NODE_ENV } from "astro:env/server";
import type { Database } from "../db";

export interface AppContext {
	Bindings: {
		db: Database;
		NODE_ENV: typeof NODE_ENV;
	};
}
