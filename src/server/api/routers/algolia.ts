import type { AppContext } from "../types";
import { ALGOLIA_CONNECTOR_PASSWORD } from "astro:env/server";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { getLatestPackages } from "~/lib/package";

const algoliaRouter = new Hono<AppContext>();

algoliaRouter.get("/", basicAuth({ username: "algolia", password: ALGOLIA_CONNECTOR_PASSWORD }), async (c) => {
	const packages = await getLatestPackages(c.env.db);
	return c.json(packages);
});

export default algoliaRouter;
