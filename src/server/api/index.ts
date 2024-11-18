import type { AppContext } from "./types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import apikeyRouter from "./routers/apikey";
import archiveRouter from "./routers/archive";
import packagesRouter from "./routers/package";
import workflowRouter from "./routers/workflow";

export const app = new OpenAPIHono<AppContext>().basePath("/api");

// Register middlewares
app.use(logger());

// Register routers
app.route("/apikey", apikeyRouter);
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
