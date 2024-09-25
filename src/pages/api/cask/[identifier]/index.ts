import type { APIContext } from "astro";
import { z } from "astro/zod";
import { drizzle } from "drizzle-orm/d1";
import { fetchHomebrewCask } from "~/lib/fetch";
import { findPackageByIdentifier, PkgIdentifier } from "~/lib/package";
import { caskPackages } from "~/schema";

const Params = z.object({
  identifier: PkgIdentifier,
});

export async function GET({ locals, params }: APIContext) {
  const result = Params.safeParse(params);
  if (!result.success) {
    return new Response("Bad Request", { status: 400 });
  }
  const cask = await findPackageByIdentifier(locals.runtime.env.DB, result.data.identifier);
  if (!cask) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(JSON.stringify(cask.cask), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST({ locals, params }: APIContext) {
  const result = Params.safeParse(params);
  if (!result.success) {
    return new Response("Bad Request", { status: 400 });
  }
  const cask = await findPackageByIdentifier(locals.runtime.env.DB, result.data.identifier);
  if (!cask) {
    return new Response("Not Found", { status: 404 });
  }

  const latest = await fetchHomebrewCask(cask.pname);
  if (latest.hash === cask.hash) {
    return new Response(null, { status: 304 });
  }

  const [created] = await drizzle(locals.runtime.env.DB)
    .insert(caskPackages)
    .values(latest)
    .returning();
  return new Response(JSON.stringify(created), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
