import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";
import type { APIContext } from "astro";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { createDatabase, packages, type Database } from "~/db";
import { createApiKey, verifyApiKey } from "~/lib/apikey";
import { fetchCaskFromUrl } from "~/lib/fetch";
import { findPackageByIdentifier, PkgIdentifier } from "~/lib/package";

interface AppContext {
  Bindings: {
    DB: Database;
  };
}

const app = new OpenAPIHono<AppContext>().basePath("/api");

app.use(logger());

const Apikey = z.string().openapi({
  description: "API key used to authenticate requests",
  example: "xxxxxxxxx.xxxxxxxxxxxxxxxxx",
});

const newApiKeyRoute = createRoute({
  method: "post",
  path: "/apikey",
  responses: {
    200: {
      description: "API key created",
      content: {
        "application/json": {
          schema: z.object({
            apikey: Apikey,
          }),
        },
      },
    },
    401: {
      description: "Missing or invalid API key",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({
              description: "Unauthorized",
              enum: ["Unauthorized"],
            }),
          }),
        },
      },
    },
  },
});

async function authorizeRequest(c: Context<AppContext>): Promise<boolean> {
  const apiKey = c.req.header("x-api-key");
  if (!apiKey) {
    return false;
  }
  return await verifyApiKey(c.env.DB, apiKey);
}

app.openapi(newApiKeyRoute, async c => {
  const authorized = await authorizeRequest(c);
  if (!authorized) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const apikey = await createApiKey(c.env.DB);
  return c.json({ apikey }, 200);
});

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

export async function ALL({ request, locals }: APIContext) {
  const DB = createDatabase(locals.runtime.env.DB);
  return app.fetch(request, { DB });
}
