import type { APIContext } from "astro";
import { app } from "~/server/api";
import { createDatabase } from "~/server/db";

export async function ALL({ request, locals }: APIContext) {
  const DB = createDatabase(locals.runtime.env.DB);
  return app.fetch(request, { DB, ENVIRONMENT: locals.runtime.env.ENVIRONMENT });
}
