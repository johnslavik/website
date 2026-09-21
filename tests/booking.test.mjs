import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readContact, requestKey, saveRequest } from '../src/lib/server/booking-requests.ts';
const key = '11111111-1111-4111-8111-111111111111';
const input = {
	name: 'Example Person',
	email: 'example@example.com',
	note: 'Test message',
	timeZone: 'Europe/Warsaw',
	preferredTime: ''
};
const request = (body = input, origin = 'https://slawecki.dev') =>
	new Request('https://slawecki.dev/api/booking/request', {
		method: 'POST',
		headers: { origin, 'content-type': 'application/json', 'idempotency-key': key },
		body: JSON.stringify(body)
	});
test('rejects cross-origin submissions', () =>
	assert.throws(() => requestKey(request(input, 'https://example.net'))));
test('requires an idempotency key', () => {
	const r = request();
	r.headers.delete('idempotency-key');
	assert.throws(() => requestKey(r));
});
test('normalizes contact fields', async () => {
	const result = await readContact(
		request({ ...input, name: ' Example ', email: 'EXAMPLE@example.com ' })
	);
	assert.equal(result.name, 'Example');
	assert.equal(result.email, 'example@example.com');
});
for (const [label, change] of Object.entries({
	honeypot: { website: 'bot' },
	email: { email: 'invalid' },
	name: { name: ' ' },
	timezone: { timeZone: 'invalid' },
	oversized: { note: 'a'.repeat(9000) }
}))
	test(`rejects ${label}`, async () =>
		assert.rejects(() => readContact(request({ ...input, ...change }))));
function database() {
	let row;
	let writes = 0;
	return {
		get writes() {
			return writes;
		},
		prepare(sql) {
			let args;
			return {
				bind(...values) {
					args = values;
					return this;
				},
				async first() {
					return row;
				},
				async run() {
					if (sql.startsWith('INSERT INTO booking_requests')) {
						writes++;
						row = { id: args[0], payload_hash: args[1], email: args[4], status: 'pending' };
					}
					return { success: true, meta: { changes: 1 } };
				}
			};
		}
	};
}
test('same request can be retried without a second message', async () => {
	const db = database();
	await saveRequest(db, input, key, 'contact', 'test');
	await saveRequest(db, input, key, 'contact', 'test');
	assert.equal(db.writes, 1);
});
test('reusing a key with changed content is rejected', async () => {
	const db = database();
	await saveRequest(db, input, key, 'contact', 'test');
	await assert.rejects(
		() => saveRequest(db, { ...input, note: 'changed' }, key, 'contact', 'test'),
		{ status: 409 }
	);
});
test('storage failure never acknowledges a message', async () => {
	const db = {
		prepare() {
			return {
				bind() {
					return this;
				},
				first: async () => null,
				run: async () => ({ success: false })
			};
		}
	};
	await assert.rejects(() => saveRequest(db, input, key, 'contact', 'test'));
});
