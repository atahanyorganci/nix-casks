import type { APIContext } from "astro";
import { z } from "astro/zod";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sha256base64 } from "ohash";
import { Cask, caskToNix } from "../../../lib/homebrew";
import { caskPackages } from "../../../schema";

export async function POST({ params, locals }: APIContext) {
  const result = z
    .object({
      name: z.string().regex(/^[a-z0-9-]+$/),
    })
    .safeParse(params);
  if (!result.success) {
    return new Response("Bad Request", { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(`https://formulae.brew.sh/api/cask/${result.data.name}.json`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(message, { status: 500 });
  }
  if (response.status === 404) {
    return new Response("Not Found", { status: 404 });
  } else if (!response.ok) {
    return new Response("Internal Server Error", { status: 500 });
  }

  const caskDefinition = Cask.parse(await response.json());
  const cask = caskToNix(caskDefinition);

  const db = drizzle(locals.runtime.env.DB);
  const record = await db
    .select()
    .from(caskPackages)
    .where(and(eq(caskPackages.pname, cask.pname), eq(caskPackages.version, cask.version)))
    .get();
  if (record) {
    return new Response(JSON.stringify(record), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const json = JSON.stringify(cask);
  const hash = sha256base64(json);

  const caskPackage = await db
    .insert(caskPackages)
    .values({
      pname: cask.pname,
      version: cask.version,
      hash,
      cask,
    })
    .returning();

  return new Response(JSON.stringify(caskPackage), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
