CREATE TABLE `booking_holds` (
	`slot_start` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `booking_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires_at` integer NOT NULL
);
