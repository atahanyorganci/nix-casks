import type { APIContext } from "astro";
import { z } from "astro/zod";
import { Cask, caskToNix } from "../../lib/homebrew";

const Params = z.object({
  token: z.string(),
});

export async function GET({ params }: APIContext) {
  const { token } = Params.parse(params);
  const response = await fetch(`https://formulae.brew.sh/api/cask/${token}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch cask ${token}`);
  }
  const cask = Cask.parse(await response.json());
  const nix = caskToNix(cask);
  return new Response(JSON.stringify(nix), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
