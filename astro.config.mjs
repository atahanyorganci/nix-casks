import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
	output: "server",
	adapter: vercel(),
	integrations: [tailwind(), react()],
	env: {
		schema: {
			NODE_ENV: envField.enum({ context: "server", access: "public", values: ["development", "production"] }),
			POSTGRES_URL: envField.string({ context: "server", access: "secret" }),
			AWS_ACCESS_KEY_ID: envField.string({ context: "server", access: "secret" }),
			AWS_SECRET_ACCESS_KEY: envField.string({ context: "server", access: "secret" }),
			AWS_ENDPOINT_URL_S3: envField.string({ context: "server", access: "secret" }),
			AWS_BUCKET_NAME: envField.string({ context: "server", access: "secret" }),
			AWS_REGION: envField.string({ context: "server", access: "secret" }),
			QSTASH_NEXT_SIGNING_KEY: envField.string({ context: "server", access: "secret", optional: true }),
			QSTASH_CURRENT_SIGNING_KEY: envField.string({ context: "server", access: "secret", optional: true }),
			QSTASH_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
			AXIOM_DATASET: envField.string({ context: "server", access: "secret" }),
			AXIOM_ORG_ID: envField.string({ context: "server", access: "secret" }),
			AXIOM_TOKEN: envField.string({ context: "server", access: "secret" }),
			ALGOLIA_APPLICATION_ID: envField.string({ context: "server", access: "secret" }),
			ALGOLIA_SEARCH_API_KEY: envField.string({ context: "server", access: "secret" }),
			ALGOLIA_WRITE_API_KEY: envField.string({ context: "server", access: "secret" }),
			ALGOLIA_INDEX_NAME: envField.string({ context: "server", access: "public" }),
			ALGOLIA_CONNECTOR_PASSWORD: envField.string({ context: "server", access: "public" }),
		},
	},
});
