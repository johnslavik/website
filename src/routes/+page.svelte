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

<div class="relative flex min-h-60 flex-row not-sm:flex-col sm:h-screen">
	<About />
	<div class="relative flex w-full justify-center overflow-clip">
		<article
			id="socials"
			class="absolute left-8 prose prose-sm py-8 not-sm:top-0 not-sm:rounded-b-[30%] not-sm:p-4 not-sm:mix-blend-difference not-sm:prose-invert sm:fixed sm:bottom-0 sm:rounded-t-[30%]"
		>
			<Socials />
		</article>
		<enhanced:img
			class="not-sm:h-[50vh,50dvh] size-full w-screen object-cover transition-all duration-300"
			src={Hero}
			alt=""
		/>
	</div>
</div>

<style>
	@reference 'tailwindcss';
	@plugin '@tailwindcss/typography';

	@media (max-height: 32rem) and (min-width: 40rem) {
		#socials {
			@apply absolute top-0 mix-blend-difference prose-invert;
		}
	}
</style>
