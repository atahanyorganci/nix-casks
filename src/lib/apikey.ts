import { eq } from "drizzle-orm";
import { z } from "zod";
import { apiKeys, type Database } from "~/server/db";

export const ApiKey = z.string().openapi("ApiKey", {
	description: "API key used to authenticate requests",
	example: "xxxxxxxxx.xxxxxxxxxxxxxxxxx",
});

/**
 * The zero hash is a constant value that is used to represent an empty hash. Used when record
 * is not found in the database, but the function should take constant time.
 *
 * ```ts
 * const EMPTY_STRING = "";
 * const HASH = crypto.subtle.digest("SHA-512", new TextEncoder().encode(EMPTY_STRING));
 * const ZERO_HASH = btoa(String.fromCharCode(...new Uint8Array(hash)));
 * ```
 */
const ZERO_HASH
  = "z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==";

export async function createApiKey(db: Database) {
	const salt = generateRandomBase64String(12);
	const secret = generateRandomBase64String(36);

	const apiKey = `${salt}.${secret}`;
	const digest = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(apiKey));
	const hash = btoa(String.fromCharCode(...new Uint8Array(digest)));

	await db.insert(apiKeys).values({ salt, hash }).returning().execute();
	return apiKey;
}

function compareStringConstantTime(a: string, b: string) {
	let equal = true;
	for (let i = 0; i < a.length; i++) {
		equal = equal && a[i] === b[i];
	}
	return equal;
}

const apiKeySchema = z
	.string()
	.transform(value => value.split("."))
	.pipe(z.tuple([z.string(), z.string()]));

export async function verifyApiKey(db: Database, apiKey: string) {
	const result = apiKeySchema.safeParse(apiKey);
	if (!result.success) {
		return false;
	}
	const [salt, secret] = result.data;
	const record = await db.query.apiKeys.findFirst({
		where: eq(apiKeys.salt, salt),
	});

	const hash = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(`${salt}.${secret}`));
	const expectedKeyHash = btoa(String.fromCharCode(...new Uint8Array(hash)));
	return compareStringConstantTime(record?.hash ?? ZERO_HASH, expectedKeyHash);
}

function generateRandomBase64String(length: number) {
	const buffer = new Uint8Array(length);
	const randomValues = crypto.getRandomValues(buffer);
	const binaryString = String.fromCharCode(...randomValues);
	return btoa(binaryString);
}
