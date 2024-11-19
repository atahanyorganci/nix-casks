import type { AppContext } from "../types";
import { serve } from "@upstash/workflow/hono";
import { QSTASH_TOKEN } from "astro:env/server";
import { Hono } from "hono";
import { uploadPackageArchive } from "~/lib/archive";
import { updateHomebrewCasks } from "~/lib/package";
import { authorizeQstashRequest } from "../util";

const workflowRouter = new Hono<AppContext>();

workflowRouter.post("/homebrew", async (c) => {
	const authorized = await authorizeQstashRequest(c);
	if (!authorized) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	const handler = serve(async (ctx) => {
		const { updateCount } = await ctx.run("fetch-homebrew-casks", async () => {
			const packages = await updateHomebrewCasks(c.env.db);
			return { updateCount: packages.length };
		});
		await ctx.run("upload-archive", async () => {
			if (updateCount === 0) {
				return;
			}
			return await uploadPackageArchive(c.env.db);
		});
	}, {
		env: {
			QSTASH_TOKEN,
		},
	});
	// @ts-expect-error The error occurs because `AppContext` doesn't have `QSTASH_TOKEN` property but we are passing it in the `env` object.
	return await handler(c);
});

export default workflowRouter;
