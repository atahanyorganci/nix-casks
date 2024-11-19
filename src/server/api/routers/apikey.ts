import type { AppContext } from "../types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ApiKey, createApiKey } from "~/lib/apikey";
import { authorizeApiKey } from "../util";

const apikeyRouter = new OpenAPIHono<AppContext>();

apikeyRouter.openapi(
	createRoute({
		description: "Create a new API key",
		method: "post",
		path: "/",
		request: {
			headers: z.object({
				"x-api-key": ApiKey,
			}),
		},
		responses: {
			200: {
				description: "API key created",
				content: {
					"application/json": {
						schema: z.object({
							apikey: ApiKey,
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
	}),
	async (c) => {
		const authorized = await authorizeApiKey(c);
		if (!authorized) {
			return c.json({ message: "Unauthorized" }, 401);
		}
		const apikey = await createApiKey(c.env.db);
		return c.json({ apikey }, 200);
	},
);

export default apikeyRouter;
