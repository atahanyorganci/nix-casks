import type { AppContext } from "../types";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UnsupportedArtifactError } from "~/lib";
import { ApiKey } from "~/lib/apikey";
import { cask2nix } from "~/lib/homebrew";
import {
	fetchCaskFromUrl,
	getLatestNixPackages,
	getPackage,
	NixPackage,
	PackageName,
	PackageVersion,
	updateHomebrewCasks,
} from "~/lib/package";
import { packages } from "~/server/db";
import { authorizeApiKey, authorizeQstashRequest } from "../util";

const packagesRouter = new OpenAPIHono<AppContext>();

packagesRouter.openapi(
	createRoute({
		method: "get",
		path: "/",
		description: "Get latest version of all packages",
		responses: {
			200: {
				description: "List of packages",
				content: {
					"application/json": {
						schema: NixPackage.array().openapi({
							description: "List of packages",
						}),
					},
				},
			},
		},
	}),
	async (c) => {
		const packages = await getLatestNixPackages(c.env.db);
		return c.json(packages, 200);
	},
);

packagesRouter.openapi(
	createRoute({
		method: "post",
		path: "/",
		description: "Add a new package",
		request: {
			headers: z.object({
				"x-api-key": ApiKey,
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							url: z.string().url().openapi({
								description: "URL of the package to add",
								example: "https://formulae.brew.sh/api/cask/visual-studio-code.json",
							}),
						}),
					},
				},
			},
		},
		responses: {
			200: {
				description: "Package found",
				content: {
					"application/json": {
						schema: NixPackage,
					},
				},
			},
			201: {
				description: "New package created",
				content: {
					"application/json": {
						schema: NixPackage,
					},
				},
			},
			400: {
				description: "Bad Request",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "Error message",
								examples: [
									"Package doesn't have a valid version.",
									"Package doesn't have a valid checksum.",
								],
							}),
						}),
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
		},
	}),
	async (c) => {
		const authorized = await authorizeApiKey(c);
		if (!authorized) {
			return c.json({ message: "Unauthorized" }, 401);
		}

		const { url } = c.req.valid("json");
		const cask = await fetchCaskFromUrl(url);
		if (cask.version === "latest") {
			return c.json({ message: "Package doesn't have a valid version." }, 400);
		}
		else if (cask.sha256 === "no_check") {
			return c.json({ message: "Package doesn't have a valid checksum." }, 400);
		}

		try {
			const nix = cask2nix(cask);
			const record = await getPackage(c.env.db, cask.token, cask.version);
			if (record) {
				return c.json(record.nix as NixPackage, 200);
			}

			const [{ nix: persistedPackage }] = await c.env.db.insert(packages)
				.values({ name: cask.name[0], nix, url })
				.returning();
			return c.json(persistedPackage as NixPackage, 201);
		}
		catch (error) {
			if (error instanceof UnsupportedArtifactError) {
				return c.json({ message: error.message }, 400);
			}
			throw error;
		}
	},
);

packagesRouter.openapi(
	createRoute({
		method: "get",
		path: "/{pname}",
		description: "Get latest version of a package by its name",
		request: {
			params: z.object({
				pname: PackageName,
			}),
		},
		responses: {
			200: {
				description: "Package found",
				content: {
					"application/json": {
						schema: NixPackage,
					},
				},
			},
			404: {
				description: "Package not found",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "Error message",
								example: "Package not found",
							}),
						}),
					},
				},
			},
		},
	}),
	async (c) => {
		const { pname } = c.req.valid("param");
		const record = await getPackage(c.env.db, pname);
		if (!record) {
			return c.json({ message: "Package not found" }, 404);
		}
		return c.json(record.nix as NixPackage, 200, {
			"Cache-Control": "public, max-age=3600",
		});
	},
);

packagesRouter.openapi(
	createRoute({
		method: "get",
		path: "/{pname}/{version}",
		description: "Get a package by its name and version",
		request: {
			params: z
				.object({
					pname: PackageName,
					version: PackageVersion,
				})
				.openapi("GetPackageParams"),
		},
		responses: {
			200: {
				description: "Package found",
				content: {
					"application/json": {
						schema: NixPackage,
					},
				},
			},
			404: {
				description: "Package not found",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "Error message",
								example: "Package not found",
							}),
						}),
					},
				},
			},
		},
	}),
	async (c) => {
		const { pname, version } = c.req.valid("param");
		const record = await getPackage(c.env.db, pname, version);
		if (!record) {
			return c.json({ message: "Package not found" }, 404);
		}
		return c.json(record.nix as NixPackage, 200, {
			"Cache-Control": "public, max-age=31536000",
		});
	},
);

packagesRouter.openapi(
	createRoute({
		method: "post",
		path: "/{pname}/update",
		description: "Update a package by its package name",
		request: {
			headers: z.object({
				"x-api-key": ApiKey,
			}),
			params: z.object({
				pname: PackageName,
			}),
		},
		responses: {
			200: {
				description: "Package found and up to date",
				content: {
					"application/json": {
						schema: NixPackage,
					},
				},
			},
			201: {
				description: "New version of the package created",
				content: {
					"application/json": {
						schema: NixPackage,
					},
				},
			},
			400: {
				description: "Bad request",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "Error message",
								examples: [
									"Package doesn't have a valid version.",
									"Package doesn't have a valid checksum.",
								],
							}),
						}),
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
			404: {
				description: "Package not found",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string().openapi({
								description: "Error message",
								example: "Package not found",
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

		const { pname } = c.req.valid("param");
		const record = await getPackage(c.env.db, pname);
		if (!record) {
			return c.json({ message: "Package not found" }, 404);
		}

		const cask = await fetchCaskFromUrl(record.url);
		if (cask.version === "latest") {
			return c.json({ message: "Package doesn't have a valid version." }, 400);
		}
		else if (cask.sha256 === "no_check") {
			return c.json({ message: "Package doesn't have a valid checksum." }, 400);
		}
		else if (cask.version === record.version) {
			return c.json(record.nix as NixPackage, 200);
		}

		try {
			const nix = cask2nix(cask);
			const [{ nix: persistedPackage }] = await c.env.db.insert(packages)
				.values({ name: cask.name[0], nix, url: record.url })
				.returning();
			return c.json(persistedPackage as NixPackage, 201);
		}
		catch (error) {
			if (error instanceof UnsupportedArtifactError) {
				return c.json({ message: error.message }, 400);
			}
			throw error;
		}
	},
);

packagesRouter.openapi(
	createRoute({
		method: "post",
		path: "/homebrew",
		description: "Update packages from Homebrew",
		responses: {
			200: {
				description: "Packages updated",
				content: {
					"application/json": {
						schema: NixPackage.array(),
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
		},
	}),
	async (c) => {
		const [apiKeyAuthorized, qstashAuthorized] = await Promise.all([
			authorizeApiKey(c),
			authorizeQstashRequest(c),
		]);
		if (!apiKeyAuthorized || !qstashAuthorized) {
			return c.json({ message: "Unauthorized" }, 401);
		}
		const updated = await updateHomebrewCasks(c.env.db);
		return c.json(updated.map(({ nix }) => nix as NixPackage), 200);
	},
);

export default packagesRouter;
