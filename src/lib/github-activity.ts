export function pullRequestItems(values: unknown[]) {
	return values
		.flatMap((value) => {
			if (!value || typeof value !== 'object') return [];
			const item = value as Record<string, unknown>;
			if (
				!item.pull_request ||
				typeof item.html_url !== 'string' ||
				!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/[1-9][0-9]*$/.test(
					item.html_url
				) ||
				typeof item.title !== 'string' ||
				typeof item.updated_at !== 'string' ||
				!Number.isFinite(Date.parse(item.updated_at))
			)
				return [];
			return [
				{
					repo: new URL(item.html_url).pathname.split('/').slice(1, 3).join('/'),
					title: item.title.slice(0, 220),
					url: item.html_url,
					date: item.updated_at
				}
			];
		})
		.slice(0, 5);
}
