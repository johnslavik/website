import type { SavedRequest } from './booking-requests';

export const maxNotificationAttempts = 12;

export type NotificationEnvironment = {
	APP_ENV?: string;
	DB?: D1Database;
	BOOKING_EMAIL?: SendEmail;
	NOTIFICATION_FROM?: string;
	NOTIFICATION_TO?: string;
};

const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
export function notificationsConfigured(env: NotificationEnvironment) {
	return Boolean(
		env.DB &&
		env.BOOKING_EMAIL &&
		emailPattern.test(env.NOTIFICATION_FROM ?? '') &&
		emailPattern.test(env.NOTIFICATION_TO ?? '')
	);
}

// Send request details only to the configured owner destination.
export async function deliverNotifications(env: NotificationEnvironment, now = Date.now()) {
	if (!notificationsConfigured(env)) return { sent: 0, configured: false };
	const db = env.DB!;
	const mail = env.BOOKING_EMAIL!;
	let sent = 0;
	// Bound each run; the cron picks up the rest and expired leases after a crash.
	for (let index = 0; index < 10; index++) {
		const token = crypto.randomUUID();
		const row = await db
			.prepare(
				`UPDATE booking_notifications
      SET lease_token = ?, leased_until = ?, attempts = attempts + 1
      WHERE request_id = (SELECT request_id FROM booking_notifications
        WHERE delivered_at IS NULL AND attempts < 12 AND next_attempt_at <= ? AND leased_until <= ?
        ORDER BY next_attempt_at, request_id LIMIT 1)
      AND delivered_at IS NULL AND leased_until <= ?
      RETURNING request_id, attempts`
			)
			.bind(token, now + 300000, now, now, now)
			.first<{ request_id: string; attempts: number }>();
		if (!row) break;
		try {
			const request = await db
				.prepare('SELECT * FROM booking_requests WHERE id = ?')
				.bind(row.request_id)
				.first<SavedRequest>();
			if (!request) throw new Error('Request missing');
			const canReply = emailPattern.test(request.email);
			const meeting = Boolean(request.slot_start || request.preferred_time);
			const identity = (request.name || request.email).replace(/[\r\n]/g, ' ').slice(0, 180);
			const title = meeting ? 'Meeting request' : 'Message';
			const text = [
				`From: ${request.name} <${request.email}>`,
				`Received: ${new Date(request.created_at).toISOString()}`,
				...(meeting
					? [
							`Requested time: ${request.slot_start || request.preferred_time} (${request.time_zone}) — awaiting confirmation`
						]
					: []),
				'',
				request.note
			].join('\n');
			await mail.send({
				from: env.NOTIFICATION_FROM!,
				to: env.NOTIFICATION_TO!,
				subject: `[slawecki.dev] ${env.APP_ENV === 'production' ? '' : '[Preview] '}${title}: ${identity}`,
				...(canReply ? { replyTo: request.email } : {}),
				text
			});
			await db
				.prepare(
					'UPDATE booking_notifications SET delivered_at = ?, lease_token = NULL, leased_until = 0 WHERE request_id = ? AND lease_token = ?'
				)
				.bind(now, row.request_id, token)
				.run();
			sent++;
		} catch {
			// Do not log provider errors: they may contain addresses or message text.
			console.warn(
				row.attempts >= maxNotificationAttempts
					? 'booking_notification_delivery_exhausted'
					: 'booking_notification_retry_scheduled'
			);
			const delay = Math.min(86400000, 300000 * 2 ** Math.min(row.attempts - 1, 9));
			await db
				.prepare(
					'UPDATE booking_notifications SET next_attempt_at = ?, lease_token = NULL, leased_until = 0 WHERE request_id = ? AND lease_token = ?'
				)
				.bind(now + delay, row.request_id, token)
				.run();
		}
	}
	return { sent, configured: true };
}
