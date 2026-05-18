<script lang="ts">
	import type { Component } from 'svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const PostContent = data.content as Component;
</script>

<svelte:head>
	<title>{data.meta.title} — John Slavik</title>
	<meta name="description" content={data.meta.description} />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-12">
	<article class="prose prose-gray max-w-none">
		<h1>{data.meta.title}</h1>
		<time class="not-prose text-xs text-gray-400">{data.meta.date}</time>
		<PostContent />
	</article>
</main>
