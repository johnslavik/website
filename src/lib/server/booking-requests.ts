type ContactInput = {
	name: string;
	email: string;
	note: string;
	timeZone: string;
	preferredTime: string;
	start?: string;
};

export type SavedRequest = {
	id: string;
	payload_hash: string;
	kind: string;
	name: string;
	email: string;
	note: string;
	time_zone: string;
	preferred_time: string;
	slot_start: string | null;
	status: 'pending' | 'booked' | 'handled';
	confirmation: string | null;
	created_at: number;
	updated_at: number;
};

export class RequestError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

export async function digest(value: string) {
	const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function requestKey(request: Request) {
	if (request.headers.get('origin') !== new URL(request.url).origin)
		throw new RequestError('Refresh the page and try again.', 403);
	if (!request.headers.get('content-type')?.startsWith('application/json'))
		throw new RequestError('Invalid request.', 400);
	const key = request.headers.get('idempotency-key');
	if (!key || !/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(key))
		throw new RequestError('Refresh the page and try again.', 400);
	return key.toLowerCase();
}

export async function readContact(
	request: Request,
	{ requireName = true }: { requireName?: boolean } = {}
): Promise<ContactInput> {
	const reader = request.body?.getReader();
	if (!reader) throw new RequestError('Enter your contact details.', 400);
	let size = 0;
	let body = '';
	const decoder = new TextDecoder();
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > 8192) {
			await reader.cancel();
			throw new RequestError('Your message is too long.', 413);
		}
		body += decoder.decode(value, { stream: true });
	}
	body += decoder.decode();
	try {
		const input = JSON.parse(body);
		if (
			!input ||
			input.website ||
			(input.name !== undefined && typeof input.name !== 'string') ||
			(requireName && !input.name?.trim()) ||
			(input.name?.length ?? 0) > 120 ||
			typeof input.email !== 'string' ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) ||
			input.email.length > 254 ||
			typeof input.note !== 'string' ||
			input.note.length > 1500 ||
			typeof input.timeZone !== 'string' ||
			input.timeZone.length > 80 ||
			(input.preferredTime !== undefined &&
				(typeof input.preferredTime !== 'string' || input.preferredTime.length > 200)) ||
			(input.start !== undefined &&
				(typeof input.start !== 'string' || !Number.isFinite(Date.parse(input.start))))
		)
			throw new Error('input');
		new Intl.DateTimeFormat('pl', { timeZone: input.timeZone });
		return {
			name: (input.name ?? '').trim(),
			email: input.email.trim().toLowerCase(),
			note: input.note.trim(),
			timeZone: input.timeZone,
			preferredTime: (input.preferredTime || '').trim(),
			...(input.start ? { start: new Date(input.start).toISOString() } : {})
		};
	} catch {
		throw new RequestError('Check your name, email and message.', 400);
	}
}

// Await durable storage before contacting Google or acknowledging the request.
// The same key and payload always refer to the same inbox entry.
export async function saveRequest(
	db: D1Database,
	input: ContactInput,
	key: string,
	kind: 'contact' | 'reservation',
	rateIdentity: string,
	now = Date.now()
): Promise<SavedRequest> {
	const hash = await digest(
		JSON.stringify([
			kind,
			input.name,
			input.email,
			input.note,
			input.timeZone,
			input.preferredTime,
			input.start || null
		])
	);
	const find = () =>
		db.prepare('SELECT * FROM booking_requests WHERE id = ?').bind(key).first<SavedRequest>();
	const check = (row: SavedRequest) => {
		if (row.payload_hash !== hash)
			throw new RequestError('The request has changed. Please send it again.', 409);
		return row;
	};
	const existing = await find();
	if (existing) return check(existing);
	await db.prepare('DELETE FROM booking_rate_limits WHERE expires_at <= ?').bind(now).run();
	const rateKey = `contact:${await digest(`${rateIdentity}:${Math.floor(now / 900000)}`)}`;
	const rate = await db
		.prepare(
			'INSERT INTO booking_rate_limits (key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1 WHERE attempts < 5'
		)
		.bind(rateKey, now + 900000)
		.run();
	if (!rate.success) throw new Error('Request storage unavailable');
	if (!rate.meta.changes)
		throw new RequestError('Too many requests. Please try again in 15 minutes.', 429);
	const result = await db
		.prepare(
			"INSERT INTO booking_requests (id, payload_hash, kind, name, email, note, time_zone, preferred_time, slot_start, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?) ON CONFLICT(id) DO NOTHING"
		)
		.bind(
			key,
			hash,
			kind,
			input.name,
			input.email,
			input.note,
			input.timeZone,
			input.preferredTime,
			input.start || null,
			now,
			now
		)
		.run();
	if (!result.success) throw new Error('Request storage unavailable');
	const saved = await find();
	if (!saved) throw new Error('Request was not saved');
	return check(saved);
}

export async function markBooked(db: D1Database, id: string, confirmation: unknown) {
	await db
		.prepare(
			"UPDATE booking_requests SET status = 'booked', confirmation = ?, updated_at = ? WHERE id = ?"
		)
		.bind(JSON.stringify(confirmation), Date.now(), id)
		.run();
}
