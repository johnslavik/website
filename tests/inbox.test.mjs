import { test } from 'node:test';
import assert from 'node:assert/strict';
import inbox from '../worker-inbox.ts';
const db = {
	prepare() {
		throw new Error('Unexpected database access');
	}
};
test('inbox rejects public hosts and cross-site navigation before accessing private data', async () => {
	assert.equal((await inbox.fetch(new Request('https://example.com/'), { DB: db })).status, 404);
	assert.equal(
		(
			await inbox.fetch(
				new Request('http://localhost:8789/', { headers: { 'sec-fetch-site': 'cross-site' } }),
				{ DB: db }
			)
		).status,
		403
	);
});
test('inbox rejects cross-origin changes', async () => {
	const response = await inbox.fetch(
		new Request('http://localhost:8789/', {
			method: 'POST',
			headers: { origin: 'https://example.com' },
			body: 'id=test'
		}),
		{ DB: db }
	);
	assert.equal(response.status, 403);
});
test('inbox cancels oversized streamed bodies before reading the rest', async () => {
	let cancelled = false;
	const body = new ReadableStream({
		pull(controller) {
			controller.enqueue(new Uint8Array(257));
		},
		cancel() {
			cancelled = true;
		}
	});
	const response = await inbox.fetch(
		new Request('http://localhost:8789/', {
			method: 'POST',
			headers: {
				origin: 'http://localhost:8789',
				'content-type': 'application/x-www-form-urlencoded'
			},
			body,
			duplex: 'half'
		}),
		{ DB: db }
	);
	assert.equal(response.status, 413);
	assert.equal(cancelled, true);
});
test('inbox escapes stored user content and prevents embedding', async () => {
	const fake = {
		prepare() {
			return {
				all: async () => ({
					results: [
						{
							name: '<script>alert(1)</script>',
							note: '<img src=x onerror=alert(1)>',
							created_at: 0,
							status: 'pending'
						}
					]
				})
			};
		}
	};
	const response = await inbox.fetch(new Request('http://localhost:8789/'), { DB: fake });
	const body = await response.text();
	assert.ok(!body.includes('<script>'));
	assert.ok(body.includes('&lt;script&gt;'));
	assert.ok(body.includes('&lt;img'));
	assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
	assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});
