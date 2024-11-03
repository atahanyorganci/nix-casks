import { z } from "@hono/zod-openapi";
import type { Database } from "../db";

export interface AppContext {
  Bindings: {
    DB: Database;
  };
}

export const Apikey = z.string().openapi({
  description: "API key used to authenticate requests",
  example: "xxxxxxxxx.xxxxxxxxxxxxxxxxx",
});
