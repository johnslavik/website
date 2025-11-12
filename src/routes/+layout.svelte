<script lang="ts">
	import Hero from '$lib/assets/hero.jpg?enhanced';
	import '../app.css';

	let { children } = $props();

	const preloadSrcSet = Hero.sources.avif ?? Hero.sources.webp ?? Hero.sources.jpeg;
</script>

<svelte:head>
	<link rel="preload" as="image" href={Hero.img.src} imagesrcset={preloadSrcSet} />
</svelte:head>

<enhanced:img
	id="banner"
	class="absolute size-full max-h-(--shrunk-banner-height) object-cover shadow-2xl"
	src={Hero}
	alt=""
/>
{@render children()}

<style>
	:root {
		--shrunk-banner-height: max(38vh, 35rem);
		--shrunk-banner-width: 85rem;
	}

	@media (prefers-reduced-motion: no-preference) {
		:root {
			--buildup-time: 2s;
		}

		#banner {
			animation: buildup var(--buildup-time) ease forwards;
		}

		@keyframes buildup {
			from {
				max-height: 99.9vh;
			}
			to {
				max-height: var(--shrunk-banner-height);
			}
		}
	}
</style>
