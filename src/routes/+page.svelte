<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import SectionTransition from '$lib/components/SectionTransition.svelte';
	import FooterRunner from '$lib/components/FooterRunner.svelte';
	let shell: HTMLDivElement;
	onMount(() => {
		let disposed = false;
		let cleanup: (() => void) | undefined;
		import('$lib/puzzle-physics').then(({ startPuzzlePhysics }) => {
			if (!disposed) cleanup = startPuzzlePhysics(shell);
		});
		return () => {
			disposed = true;
			cleanup?.();
		};
	});
	import Hero from '$lib/assets/bartosz-pycon.jpg?enhanced';
	import About from './About.svelte';
	import Socials from './Socials.svelte';
	import Contact from './Contact.svelte';
	import Activity from './Activity.svelte';
	import Talks from './Talks.svelte';
	const preloadSrcSet = Hero.sources.avif ?? Hero.sources.webp ?? Hero.sources.jpeg;
</script>

<svelte:head>
	<link rel="preload" as="image" href={Hero.img.src} imagesrcset={preloadSrcSet} />
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell" bind:this={shell}>
	<main id="main">
		<section class="hero" aria-labelledby="intro-title">
			<About />
			<figure class="portrait">
				<div class="photo-frame">
					<enhanced:img
						src={Hero}
						alt="Bartosz presenting Python code at PyCon PL."
						sizes="(max-width: 760px) 100vw, 45vw"
						fetchpriority="high"
					/>
				</div>
			</figure>
			<nav class="hero-index" aria-label="Main navigation">
				<a href="#activity">Open Source</a>
				<a href="#talks">Talks</a>
				<a href="#contact">Get in touch</a>
			</nav>
		</section>
		<SectionTransition />
		<Activity />
		<SectionTransition reverse />
		<Talks />
		<SectionTransition />
		<Contact />
	</main>
	<FooterRunner />
	<footer class="site-footer">
		<Socials />
		<nav class="footer-pages" aria-label="Site links">
			<a href={resolve('/privacy')} target="_blank" rel="noopener noreferrer">Privacy policy</a><a
				class="back-top"
				href="#main">Back to top</a
			>
		</nav>
	</footer>
</div>

<style>
	.footer-pages {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 24px;
		font-size: 13px;
	}
	@media (max-width: 560px) {
		.footer-pages {
			flex-wrap: wrap;
			gap: 12px;
		}
	}
	.portrait::before {
		display: block;
		content: '';
		position: absolute;
		inset: -64px -40px -64px -80px;
		background: url('/art/squares-black.svg') repeat center / 640px 280px;
		opacity: 0.32;
		mask-image: radial-gradient(ellipse at center, #000 58%, transparent 100%);
		pointer-events: none;
	}
	@media (max-width: 760px) {
		.portrait::before {
			inset: -28px -20px -32px;
		}
	}
</style>
