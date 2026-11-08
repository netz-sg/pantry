ALTER TABLE `user` ADD `calendar_token_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_calendar_token_hash_unique` ON `user` (`calendar_token_hash`);