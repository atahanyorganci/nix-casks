import type { AppContext } from "../types";
import { serve } from "@upstash/workflow/hono";
import { QSTASH_TOKEN } from "astro:env/server";
import { Hono } from "hono";
import { uploadPackageArchive } from "~/lib/archive";
import { updateHomebrewCasks } from "~/lib/package";
import { runIngestionTask } from "~/server/algolia";
import { triggerUpdateArchiveWorkflow } from "~/server/github";
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
			c.env.logger.info("Updated homebrew casks", { count: packages.length });
			return { updateCount: packages.length };
		});
		await ctx.run("upload-archive", async () => {
			if (updateCount === 0) {
				c.env.logger.info("No casks updated, skipping archive upload");
				return;
			}
			const archive = await uploadPackageArchive(c.env.db);
			if (archive) {
				c.env.logger.info("Uploaded archive", archive);
			}
			c.env.logger.error("Failed to upload archive");
		});
		await ctx.run("update-algolia-index", async () => {
			if (updateCount === 0) {
				c.env.logger.info("No casks updated, skipping Algolia update");
			}
			else {
				const task = await runIngestionTask();
				c.env.logger.info("Running Algolia update task", task);
			}
		});
		await ctx.run("trigger-update-archive-workflow", async () => {
			const { status, data: workflowData } = await triggerUpdateArchiveWorkflow();
			c.env.logger.info("Triggered update archive workflow", { status, workflowData });
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
