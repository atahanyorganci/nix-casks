import type { Context } from "hono";
import type { AppContext } from "./types";
import { verifyApiKey } from "~/lib/apikey";

export async function authorizeApiKey(c: Context<AppContext>): Promise<boolean> {
	if (c.env.NODE_ENV === "development") {
		return true;
	}
	const apiKey = c.req.header("x-api-key");
	if (!apiKey) {
		return false;
	}
	return await verifyApiKey(c.env.DB, apiKey);
}
