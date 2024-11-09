import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import apikeyRouter from "./routers/apikey";
import archiveRouter from "./routers/archive";
import packagesRouter from "./routers/package";
import type { AppContext } from "./types";

export const app = new OpenAPIHono<AppContext>().basePath("/api");

// Register middlewares
app.use(logger());

// Register routers
app.route("/apikey", apikeyRouter);
app.route("/package", packagesRouter);
app.route("archive", archiveRouter);

// Register OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "Nix Casks Documentation",
  },
});
