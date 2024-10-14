CREATE TABLE `api_keys` (
	`salt` text NOT NULL,
	`key` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cask_packages` (
	`pname` text NOT NULL,
	`version` text NOT NULL,
	`hash` text NOT NULL,
	`cask` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	PRIMARY KEY(`pname`, `version`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hash_index` ON `cask_packages` (`hash`);