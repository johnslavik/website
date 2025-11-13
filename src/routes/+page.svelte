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

<div class="relative grid w-screen h-screen min-h-60 sm:grid-cols-[auto_1fr] not-sm:grid-rows-[auto_1fr]">
	<About />
	<div class="relative flex w-full justify-center sm:justify-end overflow-hidden min-w-82">
		<article
			id="socials"
			class="absolute left-8 prose prose-sm py-8 not-sm:top-0 not-sm:rounded-b-[30%] not-sm:mix-blend-difference not-sm:prose-invert sm:fixed sm:bottom-0 sm:rounded-t-[30%]"
		>
			<Socials />
		</article>
		<enhanced:img
			id="hero"
			class="h-[75vh] object-cover transition-all duration-300 sm:size-full"
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
			@apply absolute top-0 mix-blend-difference prose-invert;
		}
	}
</style>
