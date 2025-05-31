import type { Database } from "~/server/db";
import { sql } from "drizzle-orm";
import { archives } from "~/server/db";
import { uploadObject } from "~/server/s3";
import { getLatestNixPackages } from "./package";

export async function uploadPackageArchive(db: Database) {
	const latestPackages = await getLatestNixPackages(db);
	const result = await db
		.insert(archives)
		.values({ archive: latestPackages })
		.onConflictDoNothing()
		.returning({
			sha256: archives.sha256,
			createdAt: archives.createdAt,
			json: sql<string>`${archives.archive}::text`,
		});
	if (result.length === 0) {
		return null;
	}
	const { sha256, json } = result[0];
	const key = `${sha256}.json`;
	await uploadObject({ Key: key, Body: json });
	return { key, sha256 };
}
