import type { FC, ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight } from "lucide-react";
import { cn } from "~/lib";

const INPUTS = `nix-casks = {
  url = "github:atahanyorganci/nix-casks/archive";
  inputs.nixpkgs.follows = "nixpkgs";
};`;

const SYSTEM = `environment.systemPackages = with nix-casks.packages.\${system}; [
  discord        # Discord chat client
  spotify        # Spotify music player
  vscode         # VS Code editor
  docker         # Docker Desktop
];`;

const HOME_MANAGER = `home.packages = with nix-casks.packages.\${system}; [
  discord spotify vscode docker
];`;

const REBUILD = `# For nix-darwin
darwin-rebuild switch

# For home-manager
home-manager switch`;

const Code: FC<{ code: string }> = ({ code }) => (
	<pre className="rounded-lg my-6 overflow-x-scroll text-neon-white/90 text-sm"><code>{code}</code></pre>
);

const Step: FC<{ step: number;text: string;gradient: string }> = ({ step, text, gradient }) => (
	<Tabs.Trigger value={step.toString()} className="group flex gap-4 text-left p-4 rounded-xl border transition-all duration-200 items-center border-neon-white/40 data-[state=active]:border-neon-white bg-neon-black bg-opacity-30">
		<div className={cn("w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-neon-white font-bold", gradient)}>{step}</div>
		<div className="text-neon-white/40 group-data-[state=active]:text-white">{text}</div>
	</Tabs.Trigger>
);

const StepContent: FC<{ step: number; children: ReactNode }> = ({ step, children }) => (
	<Tabs.Content value={step.toString()} className="overflow-x-scroll transition-all duration-500 px-6 py-4 rounded-xl border border-neon-white/10 text-neon-white/90 bg-neon-black bg-opacity-30">
		{children}
	</Tabs.Content>
);

const QuickStart: FC = () => (
	<section className="relative py-24 overflow-hidden">
		<div className="absolute inset-0 bg-gradient-to-b from-neon-dark to-neon-black"></div>
		<div className="absolute inset-0">
			<div className="absolute right-0 top-1/4 w-1/2 aspect-square bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1),transparent_50%)]"></div>
			<div className="absolute left-0 bottom-1/4 w-1/2 aspect-square bg-[radial-gradient(circle_at_center,rgba(250,255,0,0.1),transparent_50%)]"></div>
		</div>
		<div className="max-w-6xl relative mx-auto px-4 lg:min-h-[700px]">
			<h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-neon-white">Quick Start</h2>
			<p className="sm:text-xl text-neon-white/60 text-center mb-16 max-w-2xl mx-auto">
				Get started with NixCasks in minutes. Follow these simple steps to integrate with your existing Nix setup.
			</p>
			<Tabs.Root className="grid lg:grid-cols-[300px,1fr] gap-8" defaultValue="1">
				<Tabs.List className="flex flex-col space-y-3">
					<Step step={1} gradient="from-neon-purple to-neon-blue" text="Add to your flake inputs" />
					<Step step={2} gradient="from-neon-blue to-neon-green" text="Install packages" />
					<Step step={3} gradient="from-neon-green to-neon-yellow" text="Rebuild your system" />
				</Tabs.List>
				<StepContent step={1}>
					<h3 className="text-xl sm:text-2xl mb-2 font-bold text-transparent text-neon-white bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">Add to your flake inputs</h3>
					<p className="text-neon-white/80 sm:text-lg mb-4">
						First, add NixCasks to your flake inputs to make the packages available.
					</p>
					<Code code={INPUTS} />
				</StepContent>
				<StepContent step={2}>
					<h3 className="text-xl sm:text-2xl font-bold text-transparent text-neon-white bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">Install packages</h3>
					<p className="text-neon-white/80 sm:text-lg">
						Choose between system-wide or per-user installation:
					</p>
					<div className="space-y-6 mt-6">
						<div className="space-y-2">
							<h4 className="font-bold text-neon-white/90">System-wide installation (nix-darwin):</h4>
							<Code code={SYSTEM} />
						</div>
						<div className="space-y-2">
							<h4 className="font-bold text-neon-white/90">Per-user installation (home-manager):</h4>
							<Code code={HOME_MANAGER} />
						</div>
					</div>
				</StepContent>
				<StepContent step={3}>
					<h3 className="text-xl sm:text-2xl font-bold text-transparent text-neon-white bg-clip-text bg-gradient-to-r from-neon-green to-neon-yellow">Rebuild your system</h3>
					<p className="text-neon-white/80 sm:text-lg">
						Rebuild your system to apply the changes:
					</p>
					<Code code={REBUILD} />
				</StepContent>
			</Tabs.Root>
			<div className="flex items-center justify-center w-full mt-8">
				<a
					href="https://github.com/atahanyorganci/nix-casks/blob/main/README.md"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-6 py-3 bg-neon-black text-neon-white font-bold rounded-xl border border-neon-purple/30 hover:border-neon-purple/60 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-neon-purple/10 transition-all duration-200"
				>
					<span>View Full Documentation</span>
					<ArrowRight />
				</a>
			</div>
		</div>
	</section>
);

export default QuickStart;
