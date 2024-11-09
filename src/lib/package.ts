import { z } from "@hono/zod-openapi";
import { and, desc, eq, max } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { Cask } from "~/lib/homebrew";
import { packages, type Database } from "~/server/db";
import { NixPackage } from "./homebrew";

/**
 * Package name is a string that contains only lowercase letters, numbers, and hyphens.
 */
export const PackageName = z
  .string()
  .regex(/^[a-z0-9-_]+$/)
  .openapi({
    description: "Package name used to identify the package",
    example: "visual-studio-code",
  });
export type PackageName = z.infer<typeof PackageName>;

export const PackageVersion = z.string().openapi({
  description: "Version of the package",
  example: "1.94.2",
});
export type PackageVersion = z.infer<typeof PackageVersion>;

/**
 * Package is a record that contains the name, version, and Nix definition of a package.
 */
export const Package = z
  .object({
    name: z.string().openapi({
      description: "Name of program or package",
      example: "Visual Studio Code",
    }),
    pname: PackageName,
    version: PackageVersion,
    nix: NixPackage,
  })
  .openapi("Package");
export type Package = z.infer<typeof Package>;

export async function getLatestPackage(db: Database, pname: string) {
  return await db.query.packages.findFirst({
    where: eq(packages.pname, pname),
    orderBy: desc(packages.version),
  });
}

export async function getPackage(db: Database, pname: string, version: string) {
  return await db.query.packages.findFirst({
    where: and(eq(packages.pname, pname), eq(packages.version, version)),
  });
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
