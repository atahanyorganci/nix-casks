import antfu from "@antfu/eslint-config";

export default antfu({
	formatters: true,
	stylistic: {
		indent: "tab",
		semi: true,
		quotes: "double",
	},
	rules: {
		"ts/no-redeclare": "off",
		"regexp/no-obscure-range": "off",
	},
});
