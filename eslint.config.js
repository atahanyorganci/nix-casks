import antfu from "@antfu/eslint-config";
import tailwind from "eslint-plugin-tailwindcss";

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
	ignores: ["archive.json"],
}).append(
	tailwind.configs["flat/recommended"],
);
