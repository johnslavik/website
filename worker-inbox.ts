const escape = (value: unknown) =>
	String(value ?? '').replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
	);
export default {
	async fetch(request: Request, env: { DB: D1Database }) {
		const url = new URL(request.url);
		if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))
			return new Response('Not Found', { status: 404 });
		if (request.headers.get('sec-fetch-site') === 'cross-site')
			return new Response('Forbidden', { status: 403 });
		if (url.pathname !== '/') return new Response('Not Found', { status: 404 });
		if (request.method === 'POST') {
			if (request.headers.get('origin') !== url.origin)
				return new Response('Forbidden', { status: 403 });
			if (
				request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !==
				'application/x-www-form-urlencoded'
			)
				return new Response('Invalid request', { status: 400 });
			const reader = request.body?.getReader();
			if (!reader) return new Response('Invalid request', { status: 400 });
			let size = 0;
			let body = '';
			const decoder = new TextDecoder();
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				size += value.byteLength;
				if (size > 256) {
					await reader.cancel();
					return new Response('Request too large', { status: 413 });
				}
				body += decoder.decode(value, { stream: true });
			}
			body += decoder.decode();
			const data = new URLSearchParams(body);
			const id = data.get('id');
			const status = data.get('status');
			if (!id || !/^[a-f\d-]{36}$/i.test(id) || !['pending', 'handled'].includes(status || ''))
				return new Response('Invalid request', { status: 400 });
			await env.DB.prepare('UPDATE booking_requests SET status = ?, updated_at = ? WHERE id = ?')
				.bind(status, Date.now(), id)
				.run();
			return new Response(null, { status: 303, headers: { Location: '/' } });
		}
		if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
		const rows = await env.DB.prepare(
			'SELECT * FROM booking_requests ORDER BY created_at DESC LIMIT 100'
		).all();
		return new Response(
			`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>slawecki.dev inbox</title><style>body{font:16px/1.6 system-ui;max-width:900px;margin:40px auto;padding:0 24px;background:#f4f1e9;color:#252720}article{padding:24px 0;border-bottom:1px solid #ccc}h2{font-size:20px}pre{white-space:pre-wrap;font:inherit}button{padding:8px 12px}a{color:inherit}</style><h1>slawecki.dev inbox</h1><p>Latest 100 requests</p>${rows.results.length ? rows.results.map((r) => `<article><h2>${escape(r.name)}</h2><p>${escape(r.email)} · ${escape(r.status)} · ${escape(new Date(Number(r.created_at)).toLocaleString())}</p>${r.slot_start ? `<p>Requested time: ${escape(r.slot_start)} (${escape(r.time_zone)})</p>` : ''}<pre>${escape(r.note)}</pre><form method="post"><input type="hidden" name="id" value="${escape(r.id)}"><input type="hidden" name="status" value="${r.status === 'handled' ? 'pending' : 'handled'}"><button>${r.status === 'handled' ? 'Reopen' : 'Mark handled'}</button></form></article>`).join('') : '<p>No requests yet.</p>'}</html>`,
			{
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
					'Cache-Control': 'private, no-store',
					'X-Frame-Options': 'DENY',
					'X-Content-Type-Options': 'nosniff',
					'Referrer-Policy': 'no-referrer',
					'Content-Security-Policy':
						"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"
				}
			}
		);
	}
};
