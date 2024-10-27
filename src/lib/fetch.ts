import { HTTPException } from "hono/http-exception";
import { sha256base64 } from "ohash";
import { Cask, cask2nix } from "~/lib/homebrew";

export async function fetchCaskFromUrl(url: string) {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to fetch cask",
      cause: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
  if (response.status === 404) {
    throw new HTTPException(404, {
      message: "Cask not found",
    });
  } else if (!response.ok) {
    throw new HTTPException(500, {
      message: "Internal Server Error",
    });
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to parse cask",
      cause: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
  const result = Cask.safeParse(json);
  if (!result.success) {
    throw new HTTPException(400, {
      message: "Invalid cask definition",
      cause: result.error.flatten(),
    });
  }

  const nix = cask2nix(result.data);
  const hash = sha256base64(JSON.stringify(nix));

  return {
    pname: nix.pname,
    version: nix.version,
    hash,
    nix,
  };
}
