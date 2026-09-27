<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { sectionNavigation } from '$lib/section-navigation';
	// Fixed navigation must live outside section isolation/animation stacking contexts.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}
	let anchor: HTMLSpanElement;
	let docked = $state(false);
	let active = $state('');
	const links = [
		{ id: 'activity', title: 'Open Source' },
		{ id: 'talks', title: 'Talks' },
		{ id: 'contact', title: 'Get in touch' }
	];
	onMount(() => {
		const sections = links
			.map((link) => document.getElementById(link.id))
			.filter((section): section is HTMLElement => !!section);
		let frame = 0;
		function update() {
			frame = 0;
			const next = sectionNavigation(
				anchor.closest('.hero')!.getBoundingClientRect().bottom,
				sections.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top })),
				innerHeight
			);
			docked = next.docked;
			active = next.active;
			const hash = active === 'main' ? '' : `#${active}`;
			if (location.hash !== hash) {
				// eslint-disable-next-line svelte/no-navigation-without-resolve -- Update only the fragment, preserving the current route and query.
				replaceState(`${location.pathname}${location.search}${hash}`, page.state);
			}
		}
		function schedule() {
			if (!frame) frame = requestAnimationFrame(update);
		}
		addEventListener('scroll', schedule, { passive: true });
		addEventListener('resize', schedule);
		const observer = new ResizeObserver(schedule);
		for (const section of sections) observer.observe(section);
		const initialTarget = sections.find((section) => `#${section.id}` === location.hash);
		frame = requestAnimationFrame(() => {
			initialTarget?.scrollIntoView({ behavior: 'instant', block: 'start' });
			update();
		});
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
		};
	});
</script>

<div class="nav-anchor">
	<span class="dock-trigger" bind:this={anchor} aria-hidden="true"></span>
	<nav class="section-index" aria-label="Main navigation">
		{#each links as link (link.id)}<a href={'#' + link.id}>{link.title}</a>{/each}
	</nav>
</div>
<nav
	use:portal
	class="section-dock"
	class:docked
	aria-label="Section navigation"
	aria-hidden={!docked}
	inert={!docked}
>
	<a class="back-to-top" href={resolve('/')} aria-label="Back to top">↑</a>
	{#each links as link (link.id)}<a
			href={'#' + link.id}
			class:active={active === link.id}
			aria-current={active === link.id ? 'location' : undefined}>{link.title}</a
		>{/each}
</nav>

<style>
	.dock-trigger {
		position: absolute;
		top: 0;
		left: 0;
		width: 1px;
		height: 1px;
		pointer-events: none;
	}
	.nav-anchor {
		position: relative;
		grid-column: 1 / -1;
		width: 100%;
	}
	.section-index {
		display: flex;
		align-items: center;
		border-top: 1px solid #171717;
		border-bottom: 1px solid #e3e3e3;
	}
	.section-index a {
		flex: 1;
		padding: 16px 20px;
		font-size: 16px;
		color: #171717;
		transition: background 160ms;
	}
	.section-index a:hover {
		background: #f2f2f2;
	}
	.section-index a + a {
		border-left: 1px solid #e3e3e3;
	}
	.section-dock {
		position: fixed;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 110;
		display: flex;
		flex-direction: column;
		gap: 4px;
		pointer-events: none;
	}
	.section-dock a {
		writing-mode: vertical-rl;
		padding: 16px 11px;
		font-size: 12px;
		letter-spacing: 0.025em;
		background: #fff;
		color: #171717;
		border: 1px solid #aaa;
		transform: translateX(90px);
		opacity: 0;
		transition:
			transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 420ms ease-out,
			background 160ms;
	}
	.section-dock a.back-to-top {
		writing-mode: horizontal-tb;
		text-align: center;
		font-size: 22px;
		line-height: 1;
		padding: 11px;
		min-height: 44px;
		flex: 0 0 auto;
	}
	.section-dock.docked {
		pointer-events: auto;
	}
	.section-dock.docked a {
		transform: translateX(0);
		opacity: 1;
	}
	.section-dock a.active {
		background: #171717;
		color: white;
		border-color: #777;
	}
	.section-dock a:hover {
		background: #ddd;
		color: #171717;
	}
	a:focus-visible {
		outline: 2px solid #e52a24;
		outline-offset: 3px;
	}
	@media (max-width: 900px) {
		.section-index a {
			padding: 14px 12px;
			font-size: 14px;
			white-space: nowrap;
		}
		.section-dock {
			right: 12px;
			left: 12px;
			top: auto;
			bottom: max(12px, env(safe-area-inset-bottom));
			transform: none;
			flex-direction: row;
			gap: 0;
		}
		.section-dock a {
			writing-mode: horizontal-tb;
			flex: 1;
			text-align: center;
			padding: 12px 6px;
			min-height: 46px;
			white-space: nowrap;
			letter-spacing: 0;
			transform: translateY(80px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.section-dock a {
			transition: none;
		}
	}
</style>
