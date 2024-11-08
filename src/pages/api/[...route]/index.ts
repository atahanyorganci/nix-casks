import type { APIContext } from "astro";
import { NODE_ENV } from "astro:env/server";
import { app } from "~/server/api";
import { createDatabase } from "~/server/db";

export async function ALL({ request }: APIContext) {
  return app.fetch(request, { DB: createDatabase(), NODE_ENV });
}
