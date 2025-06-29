import antfu from "@antfu/eslint-config";
import tailwindcss from "eslint-plugin-better-tailwindcss";

export default antfu({
	astro: true,
	react: true,
	formatters: true,
	stylistic: {
		quotes: "double",
		semi: true,
		indent: "tab",
	},
	rules: {
		"ts/no-redeclare": "off",
		"regexp/no-obscure-range": "off",
		"antfu/no-top-level-await": "off",
	},
	ignores: ["archive.json", "vercel.json"],
}).append({
	plugins: {
		tailwindcss,
	},
	settings: {
		tailwindcss: {
			entrypoint: "./src/styles/global.css",
		},
	},
	rules: {
		"tailwindcss/enforce-consistent-class-order": "error",
		"tailwindcss/no-conflicting-classes": "error",
		"tailwindcss/no-duplicate-classes": "error",
		"tailwindcss/no-unnecessary-whitespace": "error",
	},
});
