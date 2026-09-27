import { json } from '@sveltejs/kit';
import snapshot from '$lib/github-snapshot.json';
import type { RequestHandler } from './$types';

import { pullRequestItems } from '$lib/github-activity';
export const GET: RequestHandler = async ({ platform }) => {
	const cache = typeof caches !== 'undefined' ? await caches.open('github-pull-requests-v1') : null;
	const key = new Request('https://slawecki.dev/api/activity?feed=pull-requests-v1');
	const cached = await cache?.match(key);
	// Cache API responses have immutable headers; the security hook adds headers.
	if (cached) return new Response(cached.body, cached);
	try {
		const response = await fetch(
			'https://api.github.com/search/issues?q=author%3Ajohnslavik+type%3Apr&sort=updated&order=desc&per_page=5',
			{
				headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'slawecki-website' },
				signal: AbortSignal.timeout(4000)
			}
		);
		if (!response.ok) throw new Error('GitHub unavailable');
		const data = (await response.json()) as { items: unknown[] };
		if (!Array.isArray(data.items)) throw new Error('Invalid response');
		const items = pullRequestItems(data.items);
		const result = json(
			{ items, cached: false },
			{ headers: { 'Cache-Control': 'public, max-age=300, s-maxage=1800' } }
		);
		if (cache && platform) platform.context.waitUntil(cache.put(key, result.clone()));
		return result;
	} catch {
		const result = json(
			{ items: snapshot, cached: true },
			{ headers: { 'Cache-Control': 'public, max-age=60' } }
		);
		if (cache && platform) platform.context.waitUntil(cache.put(key, result.clone()));
		return result;
	}
};
