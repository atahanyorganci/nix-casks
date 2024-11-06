import { z } from "@hono/zod-openapi";
import { and, desc, eq, max } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { Cask, cask2nix } from "~/lib/homebrew";
import { packages, type Database } from "~/server/db";
import type { NixPackage, Package } from "./homebrew";

/**
 * Package name is a string that contains only lowercase letters, numbers, and hyphens.
 */
export const PackageName = z
  .string()
  .regex(/^[a-z0-9-_]+$/)
  .transform(value => ({ name: value }))
  .openapi({
    description: "Name of the package",
    example: "visual-studio-code",
  });
export type PackageName = z.infer<typeof PackageName>;

/**
 * Package name with version is a string that contains a package name and a version number separated by a hyphen.
 */
export const PackageNameVersion = z
  .string()
  .regex(/^[A-z0-9.,_+]+-[a-z0-9-_]+$/)
  .transform(value => {
    const [version, name] = value.split("-");
    return { name, version };
  })
  .openapi({
    description: "Name and version of the package",
    example: "1.94.2-visual-studio-code",
  });
export type PackageNameVersion = z.infer<typeof PackageNameVersion>;

/**
 * A package identifier can be one of the following:
 * - `name`: the latest version of a package
 * - `name-version`: a specific version of a package
 */
export const PackageIdentifier = z.union([PackageName, PackageNameVersion]);
export type PackageIdentifier = z.infer<typeof PackageIdentifier>;

/**
 * Find a package by its identifier. If the identifier has hash, it will use unique index on hash.
 * If the identifier has version, it will use composite index on pname and version. Otherwise, it will
 * use index on pname and order by version in descending order.
 *
 * @param db `Database` instance from Drizzle
 * @param identifier package identifier
 * @returns package
 */
export async function findPackageByIdentifier(db: Database, identifier: PackageIdentifier) {
  if ("version" in identifier) {
    return await db.query.packages.findFirst({
      where: and(eq(packages.pname, identifier.name), eq(packages.version, identifier.version)),
    });
  } else {
    return await db.query.packages.findFirst({
      where: eq(packages.pname, identifier.name),
      orderBy: desc(packages.version),
    });
  }
}

export async function fetchCaskFromUrl(url: string): Promise<Cask> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to fetch cask",
      cause: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
  if (response.status === 404) {
    throw new HTTPException(404, {
      message: "Cask not found",
    });
  } else if (!response.ok) {
    throw new HTTPException(500, {
      message: "Internal Server Error",
    });
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to parse cask",
      cause: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
  const result = Cask.safeParse(json);
  if (!result.success) {
    throw new HTTPException(400, {
      message: "Invalid cask definition",
      cause: result.error.flatten(),
    });
  }
  return result.data;
}

export async function getLatestVersionPackages(db: Database) {
  const latest = db
    .select({
      pname: packages.pname,
      latest_version: max(packages.version).as("latest_version"),
    })
    .from(packages)
    .groupBy(packages.pname)
    .as("latest");
  const records = await db
    .select({ nix: packages.nix })
    .from(packages)
    .innerJoin(
      latest,
      and(eq(packages.pname, latest.pname), eq(packages.version, latest.latest_version)),
    )
    .orderBy(packages.pname);
  return records.map(({ nix }) => nix as NixPackage);
}
