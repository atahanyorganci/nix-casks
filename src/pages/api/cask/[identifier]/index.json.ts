import type { APIContext } from "astro";
import { z } from "astro/zod";
import { findPackageByIdentifier, PkgNameVersionHash } from "~/lib/package";

const Params = z.object({
  identifier: PkgNameVersionHash,
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
