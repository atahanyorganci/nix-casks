import { sha256base64 } from "ohash";
import { BaseError } from "~/lib";
import { Cask, caskToNix } from "~/lib/homebrew";

export class FetchError extends BaseError {
  constructor(message: string) {
    super("FetchError", message);
  }
}

export async function fetchHomebrewCask(name: string) {
  const response = await fetch(`https://formulae.brew.sh/api/cask/${name}.json`);
  if (response.status === 404) {
    throw new FetchError("Not Found");
  } else if (!response.ok) {
    throw new FetchError("Internal Server Error");
  }
  const rawCask = Cask.parse(await response.json());
  const cask = caskToNix(rawCask);

  const json = JSON.stringify(cask);
  const hash = sha256base64(json);

  return {
    pname: cask.pname,
    version: cask.version,
    hash,
    cask,
  };
}
