import type { APIRoute } from "astro";
import { generateSitemap } from "@yorganci/sitemap";

export const GET: APIRoute = async ({ site }) => {
	const sitemap = generateSitemap([
		{ loc: `https://${site!.hostname}/`, changefreq: "monthly", priority: 1 },
		{ loc: `https://${site!.hostname}/package/`, changefreq: "daily", priority: 0.8 },
	]);
	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
