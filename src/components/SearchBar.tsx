import { Search } from "lucide-react";
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
		<div className="relative w-full max-w-md group hidden lg:block">
			<input
				ref={inputRef}
				value={query}
				onChange={e => setQuery(e.target.value)}
				onKeyDown={handleInputKeyDown}
				type="search"
				placeholder="Search packages..."
				className="w-full px-4 py-2 pl-10 pr-16 border-white/10 border bg-transparent rounded-xl focus:outline-none focus:border-neon-purple/50 focus:ring-2 focus:ring-neon-purple/10 transition-all duration-200"
			/>
			<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
				<div className="flex items-center gap-1">
					<kbd className="flex items-center justify-center w-5 h-5 text-xs rounded border border-white/40 text-white/40 group-focus-within:text-white group-focus-within:border-white">⌘</kbd>
					<span className="text-xs text-white/40 group-focus-within:text-white">+</span>
					<kbd className="flex items-center justify-center w-5 h-5 text-xs rounded border border-white/40 text-white/40 group-focus-within:text-white group-focus-within:border-white">K</kbd>
				</div>
			</div>
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white" />
		</div>
	);
}
