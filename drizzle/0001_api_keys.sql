CREATE TABLE `api_keys` (
	`salt` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
