import { isMeetingTime } from '$lib/meeting-times';
import type { RequestHandler } from './$types';
import { readContact, requestKey, RequestError, saveRequest } from '$lib/server/booking-requests';
import { deliverNotifications } from '$lib/server/booking-notifications';

export const POST: RequestHandler = async ({ request, platform }) => {
	const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
	try {
		const key = requestKey(request);
		const input = await readContact(request);
		if (!input.note.trim()) throw new RequestError('Please enter a message.', 400);
		if (input.start) {
			if (!isMeetingTime(input.start, input.timeZone))
				throw new RequestError(
					'Choose a half-hour slot between 09:00 and 16:30 in your time zone.',
					400
				);
			const delay = Date.parse(input.start) - Date.now();
			if (delay < 3600000 || delay > 60 * 86400000)
				throw new RequestError(
					'Choose a time at least an hour from now, within the next 60 days.',
					400
				);
		}
		const env = platform?.env;
		if (!env?.DB || !env.BOOKING_RATE_LIMIT_SALT) throw new Error('Storage unavailable');
		const saved = await saveRequest(
			env.DB,
			input,
			key,
			input.start ? 'reservation' : 'contact',
			`${env.BOOKING_RATE_LIMIT_SALT}:${request.headers.get('cf-connecting-ip') ?? 'local'}`
		);
		platform?.context.waitUntil(
			deliverNotifications(env).catch(() => console.error('notification_queue_unavailable'))
		);
		return Response.json({ status: 'pending', requestId: saved.id }, { status: 202, headers });
	} catch (error) {
		if (error instanceof RequestError)
			return Response.json({ error: error.message }, { status: error.status, headers });
		return Response.json(
			{
				error: 'Your request could not be confirmed. Your details are still here; please try again.'
			},
			{ status: 503, headers }
		);
	}
};
