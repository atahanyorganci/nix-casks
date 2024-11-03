import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";

export default defineWorkersConfig(async () => {
  const migrationsPath = path.join(__dirname, "drizzle");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      setupFiles: ["./src/test/migrations.ts"],
      poolOptions: {
        workers: {
          singleWorker: true,
          wrangler: {
            configPath: "./wrangler.toml",
            environment: "production",
          },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
    },
  };
});
