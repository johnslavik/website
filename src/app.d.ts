/// <reference types="@cloudflare/workers-types" />
import type { NotificationEnvironment } from '$lib/server/booking-notifications';
declare global {
	namespace App {
		interface Platform {
			env: NotificationEnvironment & { DB: D1Database; BOOKING_RATE_LIMIT_SALT: string };
			context: ExecutionContext;
		}
	}
}
export {};
