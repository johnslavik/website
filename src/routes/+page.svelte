<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import SectionTransition from '$lib/components/SectionTransition.svelte';
	import FooterRunner from '$lib/components/FooterRunner.svelte';
	import SectionNav from '$lib/components/SectionNav.svelte';
	let shell: HTMLDivElement;
	onMount(() => {
		let disposed = false;
		let cleanup: (() => void) | undefined;
		const sections = shell.querySelectorAll<HTMLElement>('main > section:not(.hero)');
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const reveal = new IntersectionObserver(
			(entries) => {
				for (const entry of entries)
					if (entry.isIntersecting) {
						entry.target.classList.remove('section-pending');
						reveal.unobserve(entry.target);
					}
			},
			{ rootMargin: '0px 0px -30px 0px' }
		);
		for (const section of sections) {
			if (!motion.matches && section.getBoundingClientRect().top > innerHeight)
				section.classList.add('section-pending');
			reveal.observe(section);
		}
		const focusReveal = (event: FocusEvent) =>
			(event.target as HTMLElement).closest('section')?.classList.remove('section-pending');
		shell.addEventListener('focusin', focusReveal);
		const physics = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				physics.disconnect();
				import('$lib/puzzle-physics')
					.then(({ startPuzzlePhysics }) => {
						if (!disposed) cleanup = startPuzzlePhysics(shell);
					})
					.catch(() => {});
			},
			{ rootMargin: '300px' }
		);
		for (const section of sections) physics.observe(section);

		return () => {
			disposed = true;
			reveal.disconnect();
			physics.disconnect();
			shell.removeEventListener('focusin', focusReveal);
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
	<link
		rel="preload"
		as="image"
		href={Hero.img.src}
		imagesrcset={preloadSrcSet}
		imagesizes="(max-width: 760px) 100vw, 45vw"
	/>
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
			<SectionNav />
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
	.photo-frame {
		box-shadow:
			0 18px 26px -18px #17171755,
			0 35px 50px -30px #17171726;
	}
	.portrait::before {
		display: block;
		content: '';
		position: absolute;
		inset: -88px -72px -88px -100px;
		background: url('/art/hero-dot-shadow.svg') center / 100% 100% no-repeat;
		opacity: 0.9;
		pointer-events: none;
	}
	@media (max-width: 760px) {
		.portrait::before {
			inset: -28px -20px -32px;
		}
	}
</style>
