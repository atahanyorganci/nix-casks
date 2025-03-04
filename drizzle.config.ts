import process from "node:process";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/server/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.POSTGRES_URL!,
	},
});
