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
			className={cn("p-2 text-neon-white/60 hover:text-neon-purple transition-colors rounded-lg hover:bg-neon-white/5 stroke-neon-white/60", className)}
		>
			{children}
		</a>
	);
};

export default IconLink;
