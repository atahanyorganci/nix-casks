import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
	return new Response(`User-agent: *
Disallow: /search
Allow: /package/$
Sitemap: https://${site?.hostname}/sitemap/index.xml`, {
		headers: {
			"Content-Type": "text/plain charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
