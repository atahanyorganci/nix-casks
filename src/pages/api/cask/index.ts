import type { APIContext } from "astro";
import { z } from "astro/zod";
import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { caskPackages } from "~/schema";

const SearchParams = z.object({
  page: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().nonnegative().max(500).default(10),
});

export async function GET({ locals, request }: APIContext) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  console.log(`Fetching packages with search params: ${JSON.stringify(searchParams)}`);
  const result = SearchParams.safeParse(searchParams);
  if (!result.success) {
    return new Response("Bad Request", { status: 400 });
  }

  const db = drizzle(locals.runtime.env.DB);
  const records = await db
    .select()
    .from(caskPackages)
    .orderBy(desc(caskPackages.createdAt))
    .limit(result.data.limit)
    .offset(result.data.page * result.data.limit)
    .all();

  if (records.length === 0) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
