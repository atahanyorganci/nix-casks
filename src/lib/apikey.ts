import { z } from "astro/zod";
import { eq } from "drizzle-orm";
import { apiKeys, createDatabase } from "~/db";

export async function createApiKey(db: D1Database) {
  const salt = generateRandomBase64String(12);
  const secret = generateRandomBase64String(36);

  const apiKey = `${salt}.${secret}`;
  const hash = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(apiKey));
  const keyHash = btoa(String.fromCharCode(...new Uint8Array(hash)));

  const drizzle = createDatabase(db);
  await drizzle.insert(apiKeys).values({ salt, keyHash }).returning().execute();

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

export async function verifyApiKey(d1: D1Database, apiKey: string) {
  const result = apiKeySchema.safeParse(apiKey);
  if (!result.success) {
    return false;
  }
  const [salt, secret] = result.data;
  const db = createDatabase(d1);
  const keyHash = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.salt, salt),
  });
  if (!keyHash) {
    return false;
  }

  const hash = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(`${salt}.${secret}`));
  const expectedKeyHash = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return compareStringConstantTime(keyHash.keyHash, expectedKeyHash);
}

function generateRandomBase64String(length: number) {
  const buffer = new Uint8Array(length);
  const randomValues = crypto.getRandomValues(buffer);
  const binaryString = String.fromCharCode(...randomValues);
  return btoa(binaryString);
}
