import { zValidator } from "@hono/zod-validator";
import type { APIContext } from "astro";
import { z } from "astro/zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { caskPackages, createDatabase, type Database } from "~/db";
import { createApiKey, verifyApiKey } from "~/lib/apikey";
import { fetchCaskFromUrl } from "~/lib/fetch";
import { findPackageByIdentifier, PkgIdentifier } from "~/lib/package";

const app = new Hono<{
  Bindings: {
    DB: Database;
  };
}>().basePath("/api");

app.use(logger());

app.get("/", async c => {
  const apiKey = await createApiKey(c.env.DB);
  return c.json({ apiKey });
});

app.get("/cask", async c => {
  const records = await c.env.DB.query.caskPackages.findMany();
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
    const persistedPackage = await c.env.DB.insert(caskPackages)
      .values({
        pname,
        hash,
        version,
        cask: nix,
      })
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

export async function ALL({ request, locals }: APIContext) {
  const DB = createDatabase(locals.runtime.env.DB);
  return app.fetch(request, { DB });
}
