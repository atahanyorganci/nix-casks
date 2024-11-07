/// <reference path="../.astro/types.d.ts" />
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
type D1Database = import("@cloudflare/workers-types").D1Database;

declare namespace App {
  interface Locals extends Runtime {}
}
