import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

export * from "./schema";

export function createDatabase() {
  return drizzle({
    schema,
  });
}

export type Database = ReturnType<typeof createDatabase>;
