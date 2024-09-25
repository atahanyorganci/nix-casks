import { z } from "astro/zod";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { caskPackages } from "../schema";

const name = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .transform(value => ({ name: value }));

const nameVersion = z
  .string()
  .regex(/^[a-z0-9-]+-[0-9.]+$/)
  .transform(value => {
    const [name, version] = value.split("-");
    return { name, version };
  });

const nameVersionHash = z
  .string()
  .regex(/^[a-z0-9-]+-[0-9.]+-[A-Za-z0-9+/]+={0,2}$/)
  .transform(value => {
    const [name, version, hash] = value.split("-");
    return { name, version, hash };
  });

/**
 * A package identifier can be one of the following:
 * - `name`: the latest version of a package
 * - `name-version`: a specific version of a package
 * - `name-version-hash`: a specific version of a package with SHA256 hash
 */
export const identifier = z.union([name, nameVersion, nameVersionHash]);
export type Identifier = z.infer<typeof identifier>;

/**
 * Find a package by its identifier. If the identifier has hash, it will use unique index on hash.
 * If the identifier has version, it will use composite index on pname and version. Otherwise, it will
 * use index on pname and order by version in descending order.
 *
 * @param db D1Database
 * @param identifier package identifier
 * @returns package
 */
export async function findPackageByIdentifier(db: D1Database, identifier: Identifier) {
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
