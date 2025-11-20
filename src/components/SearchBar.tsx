import { IconSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function SearchBar() {
	const inputRef = useRef<HTMLInputElement>(null);
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			inputRef.current?.focus();
		}
	}, []);
	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
	const [query, setQuery] = useState("");
	const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") {
			return;
		}
		e.preventDefault();
		window.location.assign(`/search?q=${encodeURIComponent(query)}`);
	}, [query]);

	return (
		<div className="group relative hidden w-full max-w-md lg:block">
			<input
				ref={inputRef}
				value={query}
				onChange={e => setQuery(e.target.value)}
				onKeyDown={handleInputKeyDown}
				type="search"
				placeholder="Search packages..."
				className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 pr-16 pl-10 transition-all duration-200 focus:border-neon-purple/50 focus:ring-neon-purple/10 focus:ring-2 focus:outline-none"
			/>
			<div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
				<div className="flex items-center gap-1">
					<kbd className="flex size-5 items-center justify-center rounded border border-white/40 text-xs text-white/40 group-focus-within:border-white group-focus-within:text-white">⌘</kbd>
					<span className="text-xs text-white/40 group-focus-within:text-white">+</span>
					<kbd className="flex size-5 items-center justify-center rounded border border-white/40 text-xs text-white/40 group-focus-within:border-white group-focus-within:text-white">K</kbd>
				</div>
			</div>
			<IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40 group-focus-within:text-white" />
		</div>
	);
}
