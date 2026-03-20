import type { APIContext } from "astro";
import {
	NODE_ENV,
	QSTASH_CURRENT_SIGNING_KEY,
	QSTASH_NEXT_SIGNING_KEY,
	QSTASH_TOKEN,
	QSTASH_URL,
} from "astro:env/server";
import { app } from "~/server/api";
import { createDatabase } from "~/server/db";
import { createLogger } from "~/server/logger";

export async function ALL({ request }: APIContext) {
	return app.fetch(request, {
		db: createDatabase(),
		logger: createLogger(),
		NODE_ENV,
		QSTASH_CURRENT_SIGNING_KEY,
		QSTASH_NEXT_SIGNING_KEY,
		QSTASH_TOKEN,
		QSTASH_URL,
		UPSTASH_WORKFLOW_URL: import.meta.env.SITE,
	});
}
