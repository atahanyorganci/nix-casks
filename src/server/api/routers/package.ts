import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { fetchCaskFromUrl } from "~/lib/fetch";
import { NixPackage } from "~/lib/homebrew";
import {
  findPackageByIdentifier,
  getLatestVersionPackages,
  PackageIdentifier,
  PackageNameVersionHash,
} from "~/lib/package";
import { packages } from "~/server/db";
import { type AppContext } from "../types";
import { authorizeRequest } from "../util";

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
  async c => {
    const packages = await getLatestVersionPackages(c.env.DB);
    return c.json(packages, 200);
  },
);

packagesRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    description: "Add a new package",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({
                url: z.string().url().openapi({
                  description: "URL of the package to add",
                  example: "https://formulae.brew.sh/api/cask/visual-studio-code.json",
                }),
              })
              .openapi("CreatePackage"),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Package added",
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
                example: "Bad request",
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
  async c => {
    const authorized = authorizeRequest(c);
    if (!authorized) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const { url } = c.req.valid("json");
    const { pname: rawPackageName, hash, nix, version } = await fetchCaskFromUrl(url);
    if (version === "latest") {
      return c.json({ message: "Package doesn't have a valid version." }, 400);
    }

    const pname = rawPackageName.replace(/[^a-zA-Z0-9-]/g, "_");
    await c.env.DB.insert(packages).values({ pname, hash, version, nix, url }).execute();
    return c.json(nix, 200);
  },
);

packagesRouter.openapi(
  createRoute({
    method: "get",
    path: "/{identifier}",
    description: "Get a package by its identifier",
    request: {
      params: z
        .object({
          identifier: PackageNameVersionHash,
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
  async c => {
    const { identifier } = c.req.valid("param");
    const record = await findPackageByIdentifier(c.env.DB, identifier);
    if (!record) {
      return c.json({ message: "Package not found" }, 404);
    }
    return c.json(record.nix as NixPackage, 200);
  },
);

packagesRouter.openapi(
  createRoute({
    method: "post",
    path: "/{identifier}/update",
    description: "Update a package by its identifier",
    request: {
      params: z
        .object({
          identifier: PackageIdentifier,
        })
        .openapi("UpdatePackageParams"),
    },
    responses: {
      200: {
        description: "Package updated",
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
  async c => {
    const authorized = await authorizeRequest(c);
    if (!authorized) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const { identifier } = c.req.valid("param");
    const record = await findPackageByIdentifier(c.env.DB, identifier);
    if (!record) {
      return c.json({ message: "Package not found" }, 404);
    }

    const { pname, hash, nix, version } = await fetchCaskFromUrl(record.url);
    if (version === record.version && hash === record.hash) {
      return c.json(nix, 200);
    }

    await c.env.DB.insert(packages)
      .values({ pname, hash, version, nix, url: record.url })
      .returning();
    return c.json(nix, 200);
  },
);

export default packagesRouter;
