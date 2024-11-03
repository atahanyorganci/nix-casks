import type { Context } from "hono";
import { verifyApiKey } from "~/lib/apikey";
import type { AppContext } from "./types";

export async function authorizeRequest(c: Context<AppContext>): Promise<boolean> {
  const apiKey = c.req.header("x-api-key");
  if (!apiKey) {
    return false;
  }
  return await verifyApiKey(c.env.DB, apiKey);
}
