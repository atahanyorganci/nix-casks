import { env } from "cloudflare:test";
import { expect, it } from "vitest";
import { createDatabase } from "~/server/db";
import { createApiKey } from "./apikey";

it("should create an API key", async () => {
  const db = createDatabase(env.DB);
  const _ = await createApiKey(db);
  expect(await db.query.apiKeys.findFirst()).toBeDefined();
});
