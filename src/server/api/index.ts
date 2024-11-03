import { OpenAPIHono, z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { verifyApiKey } from "~/lib/apikey";
import { fetchCaskFromUrl } from "~/lib/fetch";
import { findPackageByIdentifier, PkgIdentifier } from "~/lib/package";
import { packages } from "~/server/db";
import apikeyRouter from "./routers/apikey";
import type { AppContext } from "./types";

export const app = new OpenAPIHono<AppContext>().basePath("/api");

app.use(logger());
app.route("/apikey", apikeyRouter);

app.get("/cask", async c => {
  const records = await c.env.DB.query.packages.findMany();
  return c.json(records);
});

function unauthorized(message?: string): never {
  throw new HTTPException(401, {
    message: message || "Unauthorized",
  });
}

app.use("*", async (c, next) => {
  if (c.req.method === "POST") {
    const apiKey = c.req.header("x-api-key") ?? unauthorized("API key required");
    const verified = await verifyApiKey(c.env.DB, apiKey);
    if (!verified) {
      unauthorized("Invalid API key");
    }
  }
  return await next();
});

app.post(
  "/cask/new",
  zValidator(
    "json",
    z.object({
      url: z.string().url(),
    }),
  ),
  async c => {
    const { url } = c.req.valid("json");
    const {
      pname,
      hash,
      nix: { artifacts, ...nix },
      version,
    } = await fetchCaskFromUrl(url);
    const persistedPackage = await c.env.DB.insert(packages)
      .values({ pname, hash, version, nix })
      .returning();

    return c.json(persistedPackage);
  },
);

app.get("/cask/:identifier", async c => {
  const result = z
    .object({
      identifier: PkgIdentifier,
    })
    .safeParse(c.req.param());
  if (!result.success) {
    throw new HTTPException(400, {
      message: "Invalid package identifier",
    });
  }
  const cask = await findPackageByIdentifier(c.env.DB, result.data.identifier);
  if (!cask) {
    throw new HTTPException(404, {
      message: "Package not found",
    });
  }
  return c.json(cask);
});
