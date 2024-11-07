CREATE TABLE `api_keys` (
	`salt` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`name` text NOT NULL,
	`pname` text NOT NULL,
	`version` text NOT NULL,
	`nix` text NOT NULL,
	`url` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	PRIMARY KEY(`pname`, `version`)
);
