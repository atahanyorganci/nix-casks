import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { fetchCaskFromUrl } from "~/lib/fetch";
import { findPackageByIdentifier, Package, PackageNameVersionHash } from "~/lib/package";
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
            schema: Package.array().openapi({
              description: "List of packages",
            }),
          },
        },
      },
    },
  }),
  async c => {
    const records = await c.env.DB.select({
      pname: packages.pname,
      hash: packages.hash,
      version: packages.version,
      nix: packages.nix,
    }).from(packages);
    return c.json(records, 200);
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
            schema: Package,
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
    const {
      pname,
      hash,
      nix: { artifacts, ...nix },
      version,
    } = await fetchCaskFromUrl(url);
    const [{ createdAt, ...persistedPackage }] = await c.env.DB.insert(packages)
      .values({ pname, hash, version, nix, url })
      .returning();
    return c.json(persistedPackage);
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
            schema: Package,
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
    return c.json(record, 200);
  },
);

export default packagesRouter;
