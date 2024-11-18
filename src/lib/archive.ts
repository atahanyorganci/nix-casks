import { sql } from "drizzle-orm";
import { archives, type Database } from "~/server/db";
import { uploadObject } from "~/server/s3";
import { getLatestNixPackages } from "./package";

export async function uploadPackageArchive(db: Database) {
	const archive = await db.transaction(async (tx) => {
		const latestPackages = await getLatestNixPackages(tx);
		const result = await tx
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
		try {
			const { $metadata: metadata, ..._response } = await uploadObject({
				Key: key,
				Body: json,
			});
		}
		catch (error) {
			console.error(error);
			tx.rollback();
		}
		return { key, sha256 };
	});
	return archive;
}
