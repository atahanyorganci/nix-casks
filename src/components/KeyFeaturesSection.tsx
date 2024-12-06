import type { FC } from "react";

const features = [
	{
		title: "Homebrew-Free Installation",
		description: "Install GUI applications directly through Nix without requiring Homebrew installation.",
		icon: "🚀",
		gradient: "from-neon-purple to-neon-pink",
		glow: "hover:border-neon-purple/20 hover:shadow-neon hover:shadow-neon-purple/20",
	},
	{
		title: "Nix Integration",
		description: "Seamlessly integrates with your existing Nix configuration and flakes.",
		icon: "🔧",
		gradient: "from-neon-blue to-neon-green",
		glow: "hover:border-neon-blue/20 hover:shadow-neon hover:shadow-neon-blue/20",
	},
	{
		title: "Declarative Setup",
		description: "Define your GUI applications in a declarative way, consistent with the Nix philosophy.",
		icon: "📝",
		gradient: "from-neon-yellow to-neon-green",
		glow: "hover:border-neon-yellow/20 hover:shadow-neon hover:shadow-neon-yellow/20",
	},
	{
		title: "Easy Configuration",
		description: "Simple integration with nix-darwin and home-manager for both system-wide and per-user installations.",
		icon: "⚙️",
		gradient: "from-neon-pink to-neon-blue",
		glow: "hover:border-neon-pink/20 hover:shadow-neon hover:shadow-neon-pink/20",
	},
];

const Feature: FC<{ icon: string; title: string; description: string; gradient: string; glow: string }> = ({ icon, title, description, gradient, glow }) => (
	<div className={`group rounded-xl border border-neon-white/10 bg-neon-black p-6 transition-all duration-300 ${glow}`}>
		<div className="flex items-start gap-4">
			<div className="text-2xl md:text-4xl">{icon}</div>
			<div>
				<h3 className={`mb-2 bg-clip-text text-lg font-bold text-neon-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:text-transparent md:text-xl ${gradient}`}>
					{title}
				</h3>
				<p className="font-medium leading-relaxed text-neon-white/70">
					{description}
				</p>
			</div>
		</div>
	</div>
);

const KeyFeaturesSection: FC = () => (
	<section className="relative overflow-hidden py-6 sm:py-12 lg:py-24">
		<div className="absolute inset-0 bg-gradient-to-b from-neon-black to-neon-dark"></div>
		<div className="absolute inset-0">
			<div className="absolute left-0 top-1/4 aspect-square w-1/2 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05),transparent_50%)]"></div>
			<div className="absolute bottom-1/4 right-0 aspect-square w-1/2 bg-[radial-gradient(circle_at_center,rgba(176,38,255,0.05),transparent_50%)]"></div>
		</div>
		<div className="container relative mx-auto px-4">
			<div className="mx-auto max-w-5xl">
				<h2 className="mb-4 text-center text-2xl font-bold text-neon-white sm:text-4xl md:text-5xl">Key Features</h2>
				<p className="mx-auto mb-16 max-w-2xl text-center text-neon-white/60 sm:text-xl">
					Everything you need to manage macOS applications with Nix, without the complexity of Homebrew.
				</p>
				<div className="grid gap-6 md:grid-cols-2">
					{features.map(feature => (
						<Feature key={feature.title} {...feature} />
					))}
				</div>
			</div>
		</div>
	</section>
);

export default KeyFeaturesSection;
