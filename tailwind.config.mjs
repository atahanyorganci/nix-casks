/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		container: {
			center: true,
			padding: "1rem",
		},
		extend: {
			colors: {
				neon: {
					purple: "#B026FF",
					blue: "#00F0FF",
					pink: "#FF00FF",
					yellow: "#FAFF00",
					green: "#39FF14",
					red: "#FF3131",
					white: "#FFFFFF",
					black: "#0A0A0A",
					gray: "#1E1E1E",
					dark: "#121212",
				},
			},
			boxShadow: {
				"neon": "0 0 5px var(--tw-shadow-color), 0 0 20px var(--tw-shadow-color)",
				"neon-lg": "0 0 10px var(--tw-shadow-color), 0 0 40px var(--tw-shadow-color)",
			},
		},
	},
	plugins: [],
};
