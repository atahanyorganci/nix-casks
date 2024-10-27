import type { APIContext } from "astro";
import { z } from "astro/zod";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { createDatabase, type Database } from "~/db";
import { createApiKey } from "~/lib/apikey";
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
