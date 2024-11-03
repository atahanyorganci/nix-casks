import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { packages, type Database } from "~/server/db";

/**
 * Package name is a string that contains only lowercase letters, numbers, and hyphens.
 */
export const PkgName = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .transform(value => ({ name: value }));
export type PkgName = z.infer<typeof PkgName>;

/**
 * Package name with version is a string that contains a package name and a version number separated by a hyphen.
 */
export const PkgNameVersion = z
  .string()
  .regex(/^[0-9.]+-[a-z0-9-]+$/)
  .transform(value => {
    const [version, name] = value.split("-");
    return { name, version };
  });
export type PkgNameVersion = z.infer<typeof PkgNameVersion>;

/**
 * Package name with version and hash is a string that contains a package name, a version number, and a SHA256 hash
 */
export const PkgNameVersionHash = z
  .string()
  .regex(/^[A-Za-z0-9+/]+={0,2}-[0-9.]+-[a-z0-9-]+$/)
  .transform(value => {
    const [hash, version, name] = value.split("-");
    return { name, version, hash };
  });
export type PkgNameVersionHash = z.infer<typeof PkgNameVersionHash>;

/**
 * A package identifier can be one of the following:
 * - `name`: the latest version of a package
 * - `name-version`: a specific version of a package
 * - `name-version-hash`: a specific version of a package with SHA256 hash
 */
export const PkgIdentifier = z.union([PkgName, PkgNameVersion, PkgNameVersionHash]);
export type PkgIdentifier = z.infer<typeof PkgIdentifier>;

/**
 * Find a package by its identifier. If the identifier has hash, it will use unique index on hash.
 * If the identifier has version, it will use composite index on pname and version. Otherwise, it will
 * use index on pname and order by version in descending order.
 *
 * @param db `Database` instance from Drizzle
 * @param identifier package identifier
 * @returns package
 */
export async function findPackageByIdentifier(db: Database, identifier: PkgIdentifier) {
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
