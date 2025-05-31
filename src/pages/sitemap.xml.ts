import type { APIRoute } from "astro";
import { desc } from "drizzle-orm";
import { SitemapStream, streamToPromise } from "sitemap";
import { createDatabase, packages } from "~/server/db";

export const GET: APIRoute = async ({ site }) => {
	const db = createDatabase();
	const sitemapStream = new SitemapStream({
		hostname: site?.origin,
	});
	sitemapStream.write({ url: "/", changefreq: "daily", priority: 1 });

	// Generate urls for immutable package pages
	const pkgs = await db.select({ pname: packages.pname, version: packages.version }).from(packages).orderBy(desc(packages.createdAt)).limit(49_000);
	pkgs.forEach(({ pname, version }) => sitemapStream.write({ url: `/package/${pname}/${version}`, changefreq: "never", priority: 0.5 }));

	sitemapStream.end();
	const sitemap = await streamToPromise(sitemapStream);

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
