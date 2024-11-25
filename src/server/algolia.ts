import { ingestionClient } from "@algolia/ingestion";
import { algoliasearch } from "algoliasearch";
import { ALGOLIA_APPLICATION_ID, ALGOLIA_APPLICATION_ID_REGION, ALGOLIA_SEARCH_API_KEY, ALGOLIA_TASK_ID, ALGOLIA_WRITE_API_KEY } from "astro:env/server";
import type { Package } from "~/lib/package";

export const algolia = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_API_KEY);

export const algoliaIngestionClient = ingestionClient(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY, ALGOLIA_APPLICATION_ID_REGION);

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

export async function runIngestionTask() {
	const { createdAt, runID: runId } = await algoliaIngestionClient.runTask({ taskID: ALGOLIA_TASK_ID });
	return { createdAt, runId, taskId: ALGOLIA_TASK_ID };
}
