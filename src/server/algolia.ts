import { algoliasearch } from "algoliasearch";
import { ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_API_KEY } from "astro:env/server";
import type { Package } from "~/lib/package";

export const algolia = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_API_KEY);

export async function search<T>(indexName: string, query: string) {
	return await algolia.searchSingleIndex<T>({
		indexName,
		searchParams: {
			query,
		},
	});
}

export async function searchPackages(query: string) {
	return await search<Package>("packages", query);
}
