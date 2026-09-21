CREATE TABLE `booking_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`payload_hash` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`note` text NOT NULL,
	`time_zone` text NOT NULL,
	`preferred_time` text NOT NULL,
	`slot_start` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`confirmation` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
