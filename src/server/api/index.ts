import type { AppContext } from "./types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import algoliaRouter from "./routers/algolia";
import apikeyRouter from "./routers/apikey";
import archiveRouter from "./routers/archive";
import packagesRouter from "./routers/package";
import workflowRouter from "./routers/workflow";

export const app = new OpenAPIHono<AppContext>().basePath("/api");

// Register middlewares
app.use("*", async (ctx, next) => {
	const start = performance.now();
	const requestId = crypto.randomUUID();
	ctx.env.logger = ctx.env.logger.child({ requestId });
	await next();
	const responseTime = performance.now() - start;
	ctx.env.logger.info({
		req: {
			method: ctx.req.method,
			path: ctx.req.path,
			query: ctx.req.queries(),
			headers: ctx.req.header(),
		},
		res: {
			status: ctx.res.status,
			headers: Object.fromEntries(ctx.res.headers),
		},
		requestId,
		responseTime,
	});
});

// Register routers
app.route("/apikey", apikeyRouter);
app.route("/algolia", algoliaRouter);
app.route("/package", packagesRouter);
app.route("/archive", archiveRouter);
app.route("/workflow", workflowRouter);

// Register OpenAPI documentation
app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		version: "0.0.1",
		title: "Nix Casks API",
		description: "API for creating/updating Nix derivations from Homebrew Casks",
		license: {
			name: "MIT",
			url: "https://opensource.org/licenses/MIT",
		},
	},
});

// Register Scalar documentation
app.get(
	"/reference",
	apiReference({
		pageTitle: "Nix Casks API Reference",
		spec: {
			url: "/api/openapi.json",
		},
	}),
);
