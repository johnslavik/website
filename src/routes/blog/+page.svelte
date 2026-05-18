<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog — John Slavik</title>
	<link rel="alternate" type="application/rss+xml" title="John Slavik – Python" href="/blog/python.xml" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="prose mb-2 text-3xl font-bold">Blog</h1>
	<p class="prose mb-10 text-sm text-gray-500">
		Writing on Python, CPython internals, and open source.
		<a href="/blog/python.xml" class="ml-2 hover:underline">RSS</a>
	</p>

	{#if data.posts.length === 0}
		<p class="prose text-gray-400">No posts yet.</p>
	{:else}
		<ul class="space-y-8">
			{#each data.posts as post}
				<li>
					<a href="/blog/{post.slug}" class="group block">
						<h2 class="prose text-xl font-semibold group-hover:underline">{post.title}</h2>
						<time class="prose text-xs text-gray-400">{post.date}</time>
						<p class="prose mt-1 text-gray-600">{post.description}</p>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>
