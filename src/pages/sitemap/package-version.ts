import type { APIRoute } from "astro";
import { z } from "@hono/zod-openapi";
import { generateSitemap } from "@yorganci/sitemap";
import { SITEMAP_PAGE_SIZE } from "astro:env/server";
import { desc, eq } from "drizzle-orm";
import { GENERATOR_VERSION } from "~/lib/homebrew";
import { createDatabase, packages } from "~/server/db";

const ParamsSchema = z.object({
	page: z.number().min(1).default(1),
});

export const GET: APIRoute = async ({ site, params }) => {
	const result = ParamsSchema.safeParse(params);
	if (!result.success) {
		return new Response("Invalid parameters", { status: 400 });
	}
	const { page } = result.data;

	const db = createDatabase();
	const packageVersions = await db
		.selectDistinctOn(
			[packages.pname],
			{
				pname: packages.pname,
				version: packages.version,
				createdAt: packages.createdAt,
			},
		)
		.from(packages)
		.where(eq(packages.generatorVersion, GENERATOR_VERSION))
		.orderBy(packages.pname, desc(packages.version))
		.limit(SITEMAP_PAGE_SIZE)
		.offset((page - 1) * SITEMAP_PAGE_SIZE);

	const sitemap = generateSitemap(packageVersions.map(({ pname, version, createdAt }) => ({
		loc: `https://${site?.hostname}/package/${pname}/${version}`,
		lastmod: createdAt!.toISOString().split("T")[0],
		changefreq: "never",
		priority: 0.1,
	})));

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
