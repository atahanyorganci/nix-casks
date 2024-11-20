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
	<div className={`group p-6 bg-neon-black border border-neon-white/10 rounded-xl transition-all duration-300 ${glow}`}>
		<div className="flex items-start gap-4">
			<div className="text-2xl md:text-4xl">{icon}</div>
			<div>
				<h3 className={`text-lg md:text-xl font-bold mb-2 text-neon-white bg-clip-text transition-all duration-300 group-hover:text-transparent group-hover:bg-gradient-to-r ${gradient}`}>
					{title}
				</h3>
				<p className="text-neon-white/70 font-medium leading-relaxed">
					{description}
				</p>
			</div>
		</div>
	</div>
);

const KeyFeaturesSection: FC = () => (
	<section className="relative py-6 sm:py-12 lg:py-24 overflow-hidden">
		<div className="absolute inset-0 bg-gradient-to-b from-neon-black to-neon-dark"></div>
		<div className="absolute inset-0">
			<div className="absolute left-0 top-1/4 w-1/2 aspect-square bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05),transparent_50%)]"></div>
			<div className="absolute right-0 bottom-1/4 w-1/2 aspect-square bg-[radial-gradient(circle_at_center,rgba(176,38,255,0.05),transparent_50%)]"></div>
		</div>
		<div className="container relative mx-auto px-4">
			<div className="max-w-5xl mx-auto">
				<h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-neon-white">Key Features</h2>
				<p className="sm:text-xl text-neon-white/60 text-center mb-16 max-w-2xl mx-auto">
					Everything you need to manage macOS applications with Nix, without the complexity of Homebrew.
				</p>
				<div className="grid md:grid-cols-2 gap-6">
					{features.map(feature => (
						<Feature key={feature.title} {...feature} />
					))}
				</div>
			</div>
		</div>
	</section>
);

export default KeyFeaturesSection;
