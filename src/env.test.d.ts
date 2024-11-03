declare module "cloudflare:test" {
  // Controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Env {
    // Defined in `vitest.config.mts`
    TEST_MIGRATIONS: D1Migration[];
  }
}
