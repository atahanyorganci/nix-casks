import type { FC, PropsWithChildren } from "react";
import { cn } from "~/lib";

export interface IconLinkProps {
	href: string;
	rel?: string;
	target?: string;
	title: string;
	className?: string;
}

const IconLink: FC<PropsWithChildren<IconLinkProps>> = ({ href, rel, target, title, className, children }) => {
	return (
		<a
			href={href}
			target={target}
			rel={rel}
			title={title}
			className={cn("text-neon-white/60 stroke-neon-white/60 hover:text-neon-purple hover:bg-neon-white/5 rounded-lg p-2 transition-colors", className)}
		>
			{children}
		</a>
	);
};

export default IconLink;
