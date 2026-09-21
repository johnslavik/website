<script lang="ts">
	import SectionComposition from '$lib/components/SectionComposition.svelte';
	import { onMount } from 'svelte';
	import InlineMarkdown from '$lib/components/InlineMarkdown.svelte';
	import snapshot from '$lib/github-snapshot.json';
	let items = $state<{ repo: string; title: string; url: string; date: string }[]>(snapshot);
	let loading = $state(true);
	let cached = $state(false);
	onMount(() => {
		const controller = new AbortController();
		fetch('/api/activity', { signal: controller.signal })
			.then(async (response) => {
				if (!response.ok) throw new Error('Unavailable');
				const data = (await response.json()) as { items: typeof items; cached: boolean };
				items = data.items;
				cached = data.cached;
			})
			.catch(() => {})
			.finally(() => {
				loading = false;
			});
		return () => controller.abort();
	});
</script>

<section id="activity" class="activity-section" aria-labelledby="activity-title">
	<div class="activity-art"><span aria-hidden="true">GIT<br />HUB</span><i></i><b></b></div>
	<span class="square-field activity-squares" aria-hidden="true"></span>
	<div class="activity-heading">
		<h2 id="activity-title">Open Source</h2>
		<a target="_blank" rel="noopener noreferrer" href="https://github.com/johnslavik"
			>View profile</a
		>
	</div>
	<p class="activity-intro">These days, I mostly contribute to CPython and Apache Magpie.</p>
	<div
		class="activity-list"
		style:--activity-rows={Math.max(1, items.length - 1)}
		aria-busy={loading}
	>
		{#each items as item (item.url)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- Server-validated external GitHub URL. -->
			<a target="_blank" rel="noopener noreferrer" class="activity-item" href={item.url}>
				<span class="activity-repo">{item.repo}</span>
				<span class="activity-title"><InlineMarkdown text={item.title} /></span>
				<time datetime={item.date}
					>{new Intl.DateTimeFormat('en', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
						timeZone: 'UTC'
					}).format(new Date(item.date))}</time
				>
			</a>
		{:else}
			<p class="activity-empty">
				{loading ? 'Loading recent contributions…' : 'Explore my latest contributions on GitHub.'}
			</p>
		{/each}
	</div>
	{#if cached}<p class="activity-empty">
			Recent snapshot. View GitHub for the latest updates.
		</p>{/if}
	<SectionComposition dark />
</section>
