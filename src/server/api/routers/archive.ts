import type { AppContext } from "../types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { desc, sql } from "drizzle-orm";
import { ApiKey } from "~/lib/apikey";
import { uploadPackageArchive } from "~/lib/archive";
import { archives } from "~/server/db";
import { getUrl } from "~/server/s3";
import { authorizeApiKey } from "../util";

export const ArchiveManifest = z
	.object({
		url: z.string().openapi({
			description: "URL of archive containing package definitions",
		}),
		sha256: z.string().openapi({
			description: "SHA256 checksum of the archive",
		}),
	})
	.openapi("ArchiveManifest", {
		description: "Manifest containing URL and SHA256 checksum for package definitions",
	});

const archiveRouter = new OpenAPIHono<AppContext>();

archiveRouter.openapi(
	createRoute({
		method: "post",
		path: "/",
		description: "Upload the latest package definitions as an archive",
		request: {
			headers: z.object({
				"x-api-key": ApiKey,
			}),
		},
		responses: {
			200: {
				description: "Packages uploaded",
				content: {
					"application/json": {
						schema: ArchiveManifest,
					},
				},
			},
			401: {
				description: "Unauthorized",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "Error message",
								example: "Unauthorized",
							}),
						}),
					},
				},
			},
			409: {
				description: "Conflict",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "Error message",
								example: "Package archive already exists",
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
		const archive = await uploadPackageArchive(c.env.DB);
		if (!archive) {
			return c.json({ message: "Package archive already exists" }, 409);
		}
		return c.json({ url: getUrl(archive.key), sha256: archive.sha256 }, 200);
	},
);

archiveRouter.openapi(
	createRoute({
		method: "get",
		path: "/latest",
		description: "Get the latest archive with latest package definitions",
		responses: {
			200: {
				description: "Latest package definitions",
				content: {
					"application/json": {
						schema: ArchiveManifest,
					},
				},
			},
		},
	}),
	async (c) => {
		const [{ sha256, key }] = await c.env.DB.select({
			sha256: archives.sha256,
			key: sql<string>`CONCAT(${archives.sha256}, '.json')`,
		})
			.from(archives)
			.orderBy(desc(archives.createdAt))
			.limit(1);
		return c.json({ sha256, url: getUrl(key) }, 200);
	},
);

export default archiveRouter;
