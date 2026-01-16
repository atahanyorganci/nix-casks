import type { APIRoute } from "astro";
import { z } from "@hono/zod-openapi";
import { generateSitemap } from "@yorganci/sitemap";
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
	const distinctPackages = await db
		.selectDistinctOn(
			[packages.pname],
			{
				pname: packages.pname,
				createdAt: packages.createdAt,
			},
		)
		.from(packages)
		.where(eq(packages.generatorVersion, GENERATOR_VERSION))
		.orderBy(packages.pname, desc(packages.version))
		.limit(50_000)
		.offset((page - 1) * 50_000);

	const sitemap = generateSitemap(distinctPackages.map(({ pname, createdAt }) => ({
		loc: `https://${site?.hostname}/package/${pname}`,
		lastmod: createdAt!.toISOString().split("T")[0],
		changefreq: "daily",
		priority: 0.8,
	})));

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
