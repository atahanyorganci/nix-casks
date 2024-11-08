import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [tailwind()],
  env: {
    schema: {
      POSTGRES_URL: envField.string({ context: "server", access: "public" }),
      NODE_ENV: envField.enum({
        context: "server",
        access: "public",
        values: ["development", "production"],
      }),
    },
  },
});
