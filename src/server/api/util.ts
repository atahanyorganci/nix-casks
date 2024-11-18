import type { Context } from "hono";
import type { AppContext } from "./types";
import { Receiver } from "@upstash/qstash";
import { QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY } from "astro:env/server";
import { HTTPException } from "hono/http-exception";
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

export async function authorizeQstashRequest(c: Context<AppContext>): Promise<boolean> {
	if (c.env.NODE_ENV === "development") {
		return true;
	}
	const signature = c.req.header("Upstash-Signature");
	if (!signature) {
		return false;
	}
	if (!QSTASH_CURRENT_SIGNING_KEY || !QSTASH_NEXT_SIGNING_KEY) {
		throw new HTTPException(500, {
			message: "Qstash signing keys not configured",
		});
	}
	const receiver = new Receiver({
		currentSigningKey: QSTASH_CURRENT_SIGNING_KEY,
		nextSigningKey: QSTASH_NEXT_SIGNING_KEY,
	});
	const request = c.req.raw.clone();
	const body = await request.text();
	return receiver.verify({ signature, body });
}
