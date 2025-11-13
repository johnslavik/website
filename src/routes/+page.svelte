<script lang="ts">
	import Hero from '$lib/assets/hero.jpg?enhanced';
	import '../app.css';
	import About from './About.svelte';
	import Socials from './Socials.svelte';
	const preloadSrcSet = Hero.sources.avif ?? Hero.sources.webp ?? Hero.sources.jpeg;
</script>

<svelte:head>
	<link rel="preload" as="image" href={Hero.img.src} imagesrcset={preloadSrcSet} />
</svelte:head>

<!-- You can tell this took me a lot of time to get right ;) -->

<div
	id="wrapper"
	class="relative grid min-h-60 w-screen not-sm:grid-rows-[auto_1fr] sm:grid-cols-[auto_1fr]"
>
	<About />
	<div class="relative flex min-h-60 w-full min-w-82 overflow-hidden sm:justify-end">
		<article
			id="socials"
			class="fixed not-sm:absolute prose prose-sm py-8 not-sm:rounded-b-[30%] not-sm:mix-blend-difference not-sm:prose-invert sm:bottom-0 sm:left-8 not-sm:right-8 sm:rounded-t-[30%]"
		>
			<Socials />
		</article>
		<enhanced:img
			id="hero"
			class="h-[70vh] object-cover transition-all duration-300 sm:size-full"
			src={Hero}
			alt=""
		/>
	</div>
</div>

<style>
	@reference 'tailwindcss';
	@plugin '@tailwindcss/typography';

	@media (max-height: 30rem) and (min-width: 40rem) {
		#socials {
			@apply absolute right-8 top-0 justify-self-end mix-blend-difference prose-invert;
		}
	}

	#wrapper {
		height: 100vh;
		height: 100svh;
		height: 100dvh;
	}
</style>
