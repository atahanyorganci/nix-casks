import { z } from "@hono/zod-openapi";
import { and, desc, eq } from "drizzle-orm";
import { packages, type Database } from "~/server/db";

/**
 * Package is a record that contains the name, version, and Nix definition of a package.
 */
export const Package = z
  .object({
    pname: z.string().openapi({
      description: "Name of the package",
      example: "visual-studio-code",
    }),
    hash: z.string().openapi({
      description: "SHA256 hash of the package definition",
      example: "fQ9l6WwYpzypwEOS4LxER0QDg87BBYHxnyiNUsYcDgU",
    }),
    version: z.string().openapi({
      description: "Version of the package",
      example: "1.94.2",
    }),
    nix: z.unknown().openapi({
      description: "JSON payload of the package definition used by Nix",
    }),
  })
  .openapi("Package");
export type Package = z.infer<typeof Package>;

/**
 * Package name is a string that contains only lowercase letters, numbers, and hyphens.
 */
export const PackageName = z
  .string()
  .regex(/^[a-z0-9-]+$/)
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
  .regex(/^[0-9.]+-[a-z0-9-]+$/)
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
 * Package name with version and hash is a string that contains a package name, a version number, and a SHA256 hash
 */
export const PackageNameVersionHash = z
  .string()
  .regex(/^[A-Za-z0-9+/]+={0,2}-[0-9.]+-[a-z0-9-]+$/)
  .transform(value => {
    const [hash, version, name] = value.split("-");
    return { name, version, hash };
  })
  .openapi({
    description: "Name, version, and hash of the package",
    example: "fQ9l6WwYpzypwEOS4LxER0QDg87BBYHxnyiNUsYcDgU-1.94.2-visual-studio-code",
  });
export type PackageNameVersionHash = z.infer<typeof PackageNameVersionHash>;

/**
 * A package identifier can be one of the following:
 * - `name`: the latest version of a package
 * - `name-version`: a specific version of a package
 * - `name-version-hash`: a specific version of a package with SHA256 hash
 */
export const PackageIdentifier = z.union([PackageName, PackageNameVersion, PackageNameVersionHash]);
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
  if ("hash" in identifier) {
    return await db.query.packages.findFirst({
      where: eq(packages.hash, identifier.hash),
    });
  } else if ("version" in identifier) {
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
