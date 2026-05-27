<script lang="ts">
	type Talk = {
		slug: string;
		title: string;
		date: string;
		venue?: string;
		description: string;
		href: string;
	};

	const talks: Talk[] = [
		{
			slug: 'python-3-15',
			title: 'Python 3.15 — nine things to expect',
			date: '2026-05',
			description:
				"A release retrospective. Nine PRs that shipped in 3.15, each opened as a small puzzle — a question, a snippet to predict, or a problem to imagine living with — then revealed with before/after demos.",
			href: '/talks/python-3-15.html'
		}
	];

	const sorted = [...talks].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
</script>

<svelte:head>
	<title>Talks — John Slavik</title>
	<meta
		name="description"
		content="Slides and short stories about Python, CPython, and other things I've built."
	/>
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="prose mb-2 text-3xl font-bold">Talks</h1>
	<p class="prose mb-10 text-sm text-gray-500">
		Slides and short stories about Python, CPython, and other things I've built.
	</p>

	{#if sorted.length === 0}
		<p class="prose text-gray-400">No talks yet.</p>
	{:else}
		<ul class="space-y-8">
			{#each sorted as t (t.slug)}
				<li>
					<a href={t.href} class="group block">
						<h2 class="prose text-xl font-semibold group-hover:underline">{t.title}</h2>
						<time class="prose text-xs text-gray-400">
							{t.date}{t.venue ? ` · ${t.venue}` : ''}
						</time>
						<p class="prose mt-1 text-gray-600">{t.description}</p>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>
