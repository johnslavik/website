CREATE TABLE `booking_notifications` (
	`request_id` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` integer DEFAULT 0 NOT NULL,
	`lease_token` text,
	`leased_until` integer DEFAULT 0 NOT NULL,
	`delivered_at` integer,
	FOREIGN KEY (`request_id`) REFERENCES `booking_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX booking_notifications_due ON booking_notifications (delivered_at, next_attempt_at, leased_until);
--> statement-breakpoint
CREATE TRIGGER booking_request_notification AFTER INSERT ON booking_requests
BEGIN
  INSERT INTO booking_notifications (request_id, next_attempt_at) VALUES (NEW.id, NEW.created_at);
END;
