import type { APIContext } from "astro";
import { NODE_ENV } from "astro:env/server";
import { app } from "~/server/api";
import { createNeonHttp } from "~/server/db";
import { createLogger } from "~/server/logger";

export async function ALL({ request }: APIContext) {
	return app.fetch(request, {
		db: createNeonHttp(),
		logger: createLogger(),
		NODE_ENV,
	});
}
