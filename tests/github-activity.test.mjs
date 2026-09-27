import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pullRequestItems } from '../src/lib/github-activity.ts';
const pr = {
	html_url: 'https://github.com/python/cpython/pull/12',
	title: 'Example',
	updated_at: '2026-09-27T12:00:00Z',
	pull_request: {}
};
test('activity contains PRs only; rejects commits, issues, unsafe links and malformed dates', () => {
	const invalid = [
		null,
		{},
		{ ...pr, pull_request: null },
		{ ...pr, updated_at: 'invalid' },
		...[
			'https://github.com/python/cpython/commit/abc',
			'https://github.com/python/cpython/issues/12',
			'https://evil.test/python/cpython/pull/12',
			'javascript:alert(1)',
			'https://github.com/python/cpython/pull/12?redirect=1'
		].map((html_url) => ({ ...pr, html_url }))
	];
	assert.deepEqual(pullRequestItems(invalid), []);
	assert.equal(pullRequestItems([pr])[0].repo, 'python/cpython');
	assert.equal(pullRequestItems(Array(9).fill({ ...pr, title: 'a'.repeat(300) })).length, 5);
	assert.equal(pullRequestItems([{ ...pr, title: 'a'.repeat(300) }])[0].title.length, 220);
});
test('offline activity snapshot also contains only GitHub PRs', async () => {
	const snapshot = JSON.parse(
		await readFile(new URL('../src/lib/github-snapshot.json', import.meta.url), 'utf8')
	);
	assert.ok(snapshot.length);
	for (const item of snapshot)
		assert.match(item.url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/[1-9][0-9]*$/);
});
