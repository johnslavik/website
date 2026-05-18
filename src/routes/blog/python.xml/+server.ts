import { getPythonPosts } from '$lib/posts';

const SITE_URL = 'https://slawecki.dev';

function x(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export async function GET() {
	const posts = await getPythonPosts();

	const items = posts
		.map(
			(p) => `
  <item>
    <title>${x(p.title)}</title>
    <link>${SITE_URL}/blog/${p.slug}</link>
    <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
    <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    <description>${x(p.description)}</description>
  </item>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>John Slavik – Python</title>
    <link>${SITE_URL}/blog</link>
    <description>Posts about Python and CPython from Bartosz Sławecki (John Slavik).</description>
    <atom:link href="${SITE_URL}/blog/python.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
