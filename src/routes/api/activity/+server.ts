import { json } from '@sveltejs/kit';
import snapshot from '$lib/github-snapshot.json';
import type { RequestHandler } from './$types';

type PullRequest = {
	html_url: string;
	title: string;
	updated_at: string;
	pull_request: { url: string };
};
export const GET: RequestHandler = async ({ platform }) => {
	const cache = typeof caches !== 'undefined' ? await caches.open('github-pull-requests-v1') : null;
	const key = new Request('https://slawecki.dev/api/activity?feed=pull-requests-v1');
	const cached = await cache?.match(key);
	if (cached) return cached;
	try {
		const response = await fetch(
			'https://api.github.com/search/issues?q=author%3Ajohnslavik+type%3Apr&sort=updated&order=desc&per_page=5',
			{
				headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'slawecki-website' },
				signal: AbortSignal.timeout(4000)
			}
		);
		if (!response.ok) throw new Error('GitHub unavailable');
		const data = (await response.json()) as { items: PullRequest[] };
		if (!Array.isArray(data.items)) throw new Error('Invalid response');
		const items = data.items
			.filter(
				(item) =>
					item &&
					item.pull_request &&
					typeof item.html_url === 'string' &&
					/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/[1-9][0-9]*$/.test(
						item.html_url
					) &&
					typeof item.title === 'string' &&
					typeof item.updated_at === 'string' &&
					Number.isFinite(Date.parse(item.updated_at))
			)
			.slice(0, 5)
			.map((item) => ({
				repo: new URL(item.html_url).pathname.split('/').slice(1, 3).join('/'),
				title: item.title.slice(0, 220),
				url: item.html_url,
				date: item.updated_at
			}));
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
