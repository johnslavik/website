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

<main
	class="relative grid min-h-60 w-screen not-md:grid-rows-[1fr_1fr_1fr] md:grid-cols-[1fr_1fr_1fr]"
>
	<div class="mx-auto flex flex-wrap items-center justify-evenly gap-16 not-md:py-16 md:px-16">
		<About />
	</div>
	<div class="relative flex w-full min-w-70 overflow-hidden md:justify-end">
		<enhanced:img
			id="hero"
			class="h-[70vh] object-cover duration-300 not-motion-reduce:transition-all not-md:h-[10rem] md:size-full"
			src={Hero}
			alt=""
		/>
		<i class="absolute right-2 bottom-2 prose prose-sm text-xs bg-blend-lighten text-shadow-2xs">
			Image courtesy of <a
				href="https://alicjabokina.com/"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="attribution">Alicja Bokina</a
			>
		</i>
	</div>
	<div class="mx-auto flex flex-wrap items-center justify-evenly gap-16 py-16 md:px-16">
		<article id="socials" class="prose prose-sm py-8">
			<Socials />
		</article>
	</div>
</main>

<style>
	main {
		height: 100vh;
		height: 100svh;
		height: 100dvh;
	}
</style>
