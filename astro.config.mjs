import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

export default defineConfig({
	site: "https://nix-casks.yorganci.dev",
	output: "server",
	adapter: vercel(),
	integrations: [react()],
	vite: {
		server: {
			allowedHosts: true,
		},
		plugins: [tailwindcss()],
	},
	env: {
		schema: {
			NODE_ENV: envField.enum({ context: "server", access: "public", values: ["development", "production"] }),
			NEON_DATABASE_URL: envField.string({ context: "server", access: "secret" }),
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
			ALGOLIA_APPLICATION_ID_REGION: envField.enum({ context: "server", access: "public", values: ["us", "eu"] }),
			ALGOLIA_WRITE_API_KEY: envField.string({ context: "server", access: "secret" }),
			ALGOLIA_INDEX_NAME: envField.string({ context: "server", access: "public" }),
			ALGOLIA_CONNECTOR_PASSWORD: envField.string({ context: "server", access: "secret" }),
			ALGOLIA_TASK_ID: envField.string({ context: "server", access: "secret" }),
			GITHUB_TOKEN: envField.string({ context: "server", access: "secret" }),
			GITHUB_OWNER: envField.string({ context: "server", access: "public" }),
			GITHUB_REPO: envField.string({ context: "server", access: "public" }),
			GITHUB_BRANCH: envField.string({ context: "server", access: "public" }),
			GITHUB_WORKFLOW_ID: envField.number({ context: "server", access: "public" }),
		},
	},
});
