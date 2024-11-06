DROP INDEX IF EXISTS `hash_index`;--> statement-breakpoint
ALTER TABLE `packages` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `packages` DROP COLUMN `hash`;