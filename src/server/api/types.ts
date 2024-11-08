import { z } from "@hono/zod-openapi";
import { NODE_ENV } from "astro:env/server";
import type { Database } from "../db";

export interface AppContext {
  Bindings: {
    DB: Database;
    NODE_ENV: typeof NODE_ENV;
  };
}

export const Apikey = z.string().openapi({
  description: "API key used to authenticate requests",
  example: "xxxxxxxxx.xxxxxxxxxxxxxxxxx",
});
