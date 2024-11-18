import { z } from "@hono/zod-openapi";
import { and, desc, eq, max, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { Cask } from "~/lib/homebrew";
import { type Database, packages } from "~/server/db";
import { unreachable } from ".";

export const NixPackage = z
	.object({
		pname: z.string().openapi({
			description: "Name of the package",
			example: "visual-studio-code",
		}),
		version: z.string().openapi({
			description: "Version of the package",
			example: "1.94.2",
		}),
		src: z.object({
			url: z.string().url().openapi({
				description: "URL to the source code, binary or archive",
				example: "https://update.code.visualstudio.com/1.94.2/darwin-arm64/stable",
			}),
			sha256: z.string().openapi({
				description: "SHA256 hash of the source code, binary or archive",
				example: "fQ9l6WwYpzypwEOS4LxER0QDg87BBYHxnyiNUsYcDgU",
			}),
		}),
		installPhase: z.array(z.string()).openapi({
			description: "Installation steps to be executed",
		}),
		meta: z.object({
			description: z.string().optional().openapi({
				description: "Short description of the package",
				example: "Open-source code editor",
			}),
			homepage: z.string().url().optional().openapi({
				description: "URL to the homepage of the package",
				example: "https://code.visualstudio.com/",
			}),
		}),
	})
	.openapi("NixPackage", {
		description: "JSON representation of",
	});
export type NixPackage = z.infer<typeof NixPackage>;

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

export async function getPackage(db: Database, pname: string, version?: string) {
	const where = version ? and(eq(packages.pname, pname), eq(packages.version, version)) : eq(packages.pname, pname);
	const record = await db.query.packages.findFirst({
		orderBy: desc(packages.version),
		where,
	});
	if (!record) {
		return;
	}
	const { nix, ...pkg } = record;
	return { ...pkg, nix: nix as NixPackage };
}

export async function fetchCaskFromUrl(url: string): Promise<Cask> {
	let response: Response;
	try {
		response = await fetch(url);
	}
	catch (error) {
		throw new HTTPException(500, {
			message: "Failed to fetch cask",
			cause: error instanceof Error ? error.message : "Internal Server Error",
		});
	}
	if (response.status === 404) {
		throw new HTTPException(404, {
			message: "Cask not found",
		});
	}
	else if (!response.ok) {
		throw new HTTPException(500, {
			message: "Internal Server Error",
		});
	}

	let json: unknown;
	try {
		json = await response.json();
	}
	catch (error) {
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

export async function getLatestNixPackages(db: Database): Promise<NixPackage[]> {
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
	return records.map(({ nix }) => nix) as NixPackage[];
}

export async function getLatestPackages(db: Database): Promise<Package[]> {
	const latest = db
		.select({
			pname: packages.pname,
			latest_version: max(packages.version).as("latest_version"),
		})
		.from(packages)
		.groupBy(packages.pname)
		.as("latest");
	const records = await db
		.select({ name: packages.name, pname: packages.pname, version: packages.version, nix: packages.nix })
		.from(packages)
		.innerJoin(
			latest,
			and(eq(packages.pname, latest.pname), eq(packages.version, latest.latest_version)),
		)
		.orderBy(packages.pname);
	return records as Package[];
}

export type PackageWithVersion = Exclude<Awaited<ReturnType<typeof getPackage>>, undefined>;

export async function getPackageVersions(db: Database, pname: string, version?: string) {
	const versionHistory = db
		.select({
			pname: packages.pname,
			version_history: sql<{ version: string; createdAt: string }[]>`
				json_agg(
						json_build_object(
								'version', ${packages.version},
								'createdAt', ${packages.createdAt}
						)
						ORDER BY ${packages.createdAt} DESC
				)`
				.as("version_history"),
		})
		.from(packages)
		.where(eq(packages.pname, pname))
		.groupBy(packages.pname)
		.as("versionHistory");
	const where = version ? and(eq(packages.pname, pname), eq(packages.version, version)) : eq(packages.pname, pname);
	const pkg = await db
		.select({
			name: packages.name,
			pname: packages.pname,
			version: packages.version,
			nix: packages.nix,
			createdAt: packages.createdAt,
			versionHistory: versionHistory.version_history,
		})
		.from(packages)
		.where(where)
		.orderBy(desc(packages.version))
		.limit(1)
		.innerJoin(versionHistory, eq(versionHistory.pname, packages.pname));
	if (pkg.length === 0) {
		return null;
	}
	else if (pkg.length > 1) {
		unreachable(`Multiple packages found for ${pname}@${version}`);
	}
	const [{ nix, ...record }] = pkg;
	return { ...record, nix: nix as NixPackage };
}
