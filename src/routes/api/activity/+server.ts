import { json } from '@sveltejs/kit';
import snapshot from '$lib/github-snapshot.json';
import type { RequestHandler } from './$types';

type Commit = {
	html_url: string;
	repository: { full_name: string };
	commit: { message: string; committer: { date: string } };
};
export const GET: RequestHandler = async ({ platform }) => {
	const cache = typeof caches !== 'undefined' ? await caches.open('github-activity') : null;
	const key = new Request('https://slawecki.dev/api/activity');
	const cached = await cache?.match(key);
	if (cached) return cached;
	try {
		const response = await fetch(
			'https://api.github.com/search/commits?q=author%3Ajohnslavik&sort=committer-date&order=desc&per_page=5',
			{
				headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'slawecki-website' },
				signal: AbortSignal.timeout(4000)
			}
		);
		if (!response.ok) throw new Error('GitHub unavailable');
		const data = (await response.json()) as { items: Commit[] };
		if (!Array.isArray(data.items)) throw new Error('Invalid response');
		const items = data.items
			.filter(
				(item) =>
					/^https:\/\/github\.com\/[^/]+\/[^/]+\/commit\/[a-f0-9]+$/.test(item.html_url) &&
					Number.isFinite(Date.parse(item.commit.committer.date))
			)
			.map((item) => ({
				repo: item.repository.full_name,
				title: item.commit.message.split('\n')[0].slice(0, 220),
				url: item.html_url,
				date: item.commit.committer.date
			}));
		const result = json(
			{ items, cached: false },
			{ headers: { 'Cache-Control': 'public, max-age=300, s-maxage=1800' } }
		);
		if (cache && platform) platform.context.waitUntil(cache.put(key, result.clone()));
		return result;
	} catch {
		return json(
			{ items: snapshot, cached: true },
			{ headers: { 'Cache-Control': 'public, max-age=60' } }
		);
	}
};
