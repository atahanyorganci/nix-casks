import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
	output: "server",
	adapter: vercel(),
	integrations: [tailwind()],
	env: {
		schema: {
			POSTGRES_URL: envField.string({ context: "server", access: "secret" }),
			NODE_ENV: envField.enum({
				context: "server",
				access: "secret",
				values: ["development", "production"],
			}),
			AWS_ACCESS_KEY_ID: envField.string({ context: "server", access: "secret" }),
			AWS_SECRET_ACCESS_KEY: envField.string({ context: "server", access: "secret" }),
			AWS_ENDPOINT_URL_S3: envField.string({ context: "server", access: "secret" }),
			AWS_BUCKET_NAME: envField.string({ context: "server", access: "secret" }),
			AWS_REGION: envField.string({ context: "server", access: "secret" }),
		},
	},
});
