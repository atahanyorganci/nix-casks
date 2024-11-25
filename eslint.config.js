import antfu from "@antfu/eslint-config";

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
});
