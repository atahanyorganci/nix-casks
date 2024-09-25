import { z } from "astro/zod";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { caskPackages } from "../schema";

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
  .regex(/^[a-z0-9-]+-[0-9.]+$/)
  .transform(value => {
    const [name, version] = value.split("-");
    return { name, version };
  });
export type PkgNameVersion = z.infer<typeof PkgNameVersion>;

/**
 * Package name with version and hash is a string that contains a package name, a version number, and a SHA256 hash
 */
export const PkgNameVersionHash = z
  .string()
  .regex(/^[a-z0-9-]+-[0-9.]+-[A-Za-z0-9+/]+={0,2}$/)
  .transform(value => {
    const [name, version, hash] = value.split("-");
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
 * @param db D1Database
 * @param identifier package identifier
 * @returns package
 */
export async function findPackageByIdentifier(db: D1Database, identifier: PkgIdentifier) {
  const d = drizzle(db, {
    schema: { caskPackages },
  });
  if ("hash" in identifier) {
    return d.select().from(caskPackages).where(eq(caskPackages.hash, identifier.hash)).get();
  } else if ("version" in identifier) {
    return d
      .select()
      .from(caskPackages)
      .where(
        and(eq(caskPackages.pname, identifier.name), eq(caskPackages.version, identifier.version)),
      )
      .get();
  } else {
    return d
      .select()
      .from(caskPackages)
      .where(eq(caskPackages.pname, identifier.name))
      .orderBy(desc(caskPackages.version))
      .get();
  }
}
