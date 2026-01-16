import type { APIRoute } from "astro";
import type { Database } from "~/server/db";
import { generateSitemapIndex } from "@yorganci/sitemap";
import { SITEMAP_PAGE_SIZE } from "astro:env/server";
import { sql } from "drizzle-orm";
import { createDatabase, packages } from "~/server/db";

async function countPackageVersions(db: Database) {
	const [{ count: packageVersionCount }] = await db
		.select({
			count: sql<number>`count(distinct (${packages.pname}, ${packages.version}))`.mapWith(Number),
		})
		.from(packages);
	return packageVersionCount;
}

async function countUniquePackageNames(db: Database) {
	const uniquePackageNames = await db
		.selectDistinct({
			pname: packages.pname,
		})
		.from(packages);
	return uniquePackageNames.length;
}

export const GET: APIRoute = async ({ site }) => {
	const db = createDatabase();

	// Count distinct package versions via aggregation
	const [packageVersionCount, uniquePackageNamesCount] = await Promise.all([countPackageVersions(db), countUniquePackageNames(db)]);
	const packageVersionSitemapCount = Math.ceil(packageVersionCount / SITEMAP_PAGE_SIZE);
	const uniquePackageNamesSitemapCount = Math.ceil(uniquePackageNamesCount / SITEMAP_PAGE_SIZE);

	const sitemap = generateSitemapIndex([
		{ loc: `https://${site!.hostname}/sitemap/static.xml` },
		...Array.from({ length: uniquePackageNamesSitemapCount }, (_, i) => ({ loc: `https://${site!.hostname}/sitemap/package?page=${i + 1}` })),
		...Array.from({ length: packageVersionSitemapCount }, (_, i) => ({ loc: `https://${site!.hostname}/sitemap/package-version?page=${i + 1}` })),
	]);

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
