import type { FC, ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { IconArrowRight } from "@tabler/icons-react";
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
	<pre className="my-6 overflow-x-scroll rounded-lg text-sm text-neon-white/90"><code>{code}</code></pre>
);

const Step: FC<{ step: number; text: string; gradient: string }> = ({ step, text, gradient }) => (
	<Tabs.Trigger value={step.toString()} className="group flex items-center gap-4 rounded-xl border border-neon-white/40 bg-neon-black/30 p-4 text-left transition-all duration-200 data-[state=active]:border-neon-white">
		<div className={cn("w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-neon-white font-bold", gradient)}>{step}</div>
		<div className="text-neon-white/40 group-data-[state=active]:text-white">{text}</div>
	</Tabs.Trigger>
);

const StepContent: FC<{ step: number; children: ReactNode }> = ({ step, children }) => (
	<Tabs.Content value={step.toString()} className="overflow-x-scroll rounded-xl border border-neon-white/10 bg-neon-black/30 px-6 py-4 text-neon-white/90 transition-all duration-500">
		{children}
	</Tabs.Content>
);

const QuickStart: FC = () => (
	<section className="relative overflow-hidden py-24">
		<div className="absolute inset-0 bg-gradient-to-b from-neon-dark to-neon-black"></div>
		<div className="absolute inset-0">
			<div className="absolute right-0 top-1/4 aspect-square w-1/2 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1),transparent_50%)]"></div>
			<div className="absolute bottom-1/4 left-0 aspect-square w-1/2 bg-[radial-gradient(circle_at_center,rgba(250,255,0,0.1),transparent_50%)]"></div>
		</div>
		<div className="relative mx-auto max-w-6xl px-4 lg:min-h-[700px]">
			<h2 className="mb-4 text-center text-2xl font-bold text-neon-white sm:text-4xl md:text-5xl">Quick Start</h2>
			<p className="mx-auto mb-16 max-w-2xl text-center text-neon-white/60 sm:text-xl">
				Get started with NixCasks in minutes. Follow these simple steps to integrate with your existing Nix setup.
			</p>
			<Tabs.Root className="grid gap-8 lg:grid-cols-[300px_1fr]" defaultValue="1">
				<Tabs.List className="flex flex-col space-y-3">
					<Step step={1} gradient="from-neon-purple to-neon-blue" text="Add to your flake inputs" />
					<Step step={2} gradient="from-neon-blue to-neon-green" text="Install packages" />
					<Step step={3} gradient="from-neon-green to-neon-yellow" text="Rebuild your system" />
				</Tabs.List>
				<StepContent step={1}>
					<h3 className="mb-2 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-xl font-bold text-transparent sm:text-2xl">Add to your flake inputs</h3>
					<p className="mb-4 text-neon-white/80 sm:text-lg">
						First, add NixCasks to your flake inputs to make the packages available.
					</p>
					<Code code={INPUTS} />
				</StepContent>
				<StepContent step={2}>
					<h3 className="bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-xl font-bold text-transparent sm:text-2xl">Install packages</h3>
					<p className="text-neon-white/80 sm:text-lg">
						Choose between system-wide or per-user installation:
					</p>
					<div className="mt-6 space-y-6">
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
					<h3 className="bg-gradient-to-r from-neon-green to-neon-yellow bg-clip-text text-xl font-bold text-transparent sm:text-2xl">Rebuild your system</h3>
					<p className="text-neon-white/80 sm:text-lg">
						Rebuild your system to apply the changes:
					</p>
					<Code code={REBUILD} />
				</StepContent>
			</Tabs.Root>
			<div className="mt-8 flex w-full items-center justify-center">
				<a
					href="https://github.com/atahanyorganci/nix-casks/blob/main/README.md"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-2 rounded-xl border border-neon-purple/30 bg-neon-black px-6 py-3 font-bold text-neon-white transition-all duration-200 hover:translate-y-[-2px] hover:border-neon-purple/60 hover:shadow-lg hover:shadow-neon-purple/10"
				>
					<span>View Full Documentation</span>
					<IconArrowRight />
				</a>
			</div>
		</div>
	</section>
);

export default QuickStart;
