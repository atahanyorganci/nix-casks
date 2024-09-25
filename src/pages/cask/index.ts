import type { APIContext } from "astro";
import { drizzle } from "drizzle-orm/d1";
import { caskPackages } from "../../schema";

export async function GET({ locals }: APIContext) {
  const db = drizzle(locals.runtime.env.DB);
  const packages = await db.select().from(caskPackages).all();

  return new Response(JSON.stringify(packages), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
