ALTER TABLE `cask_packages` RENAME TO `packages`;--> statement-breakpoint
ALTER TABLE `packages` RENAME COLUMN `cask` TO `nix`;