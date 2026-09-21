<script lang="ts">
	import { onMount } from 'svelte';
	let anchor: HTMLSpanElement;
	let docked = $state(false);
	let active = $state('');
	const links = [
		{ id: 'activity', title: 'Open Source' },
		{ id: 'talks', title: 'Talks' },
		{ id: 'contact', title: 'Get in touch' }
	];
	onMount(() => {
		const dockObserver = new IntersectionObserver(
			([entry]) => {
				docked = !entry.isIntersecting && entry.boundingClientRect.top < 0;
			},
			{ threshold: 0 }
		);
		const sectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) if (entry.isIntersecting) active = entry.target.id;
			},
			{ rootMargin: '-20% 0px -55% 0px' }
		);
		dockObserver.observe(anchor);
		for (const link of links) {
			const section = document.getElementById(link.id);
			if (section) sectionObserver.observe(section);
		}
		return () => {
			dockObserver.disconnect();
			sectionObserver.disconnect();
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
	class="section-dock"
	class:docked
	aria-label="Section navigation"
	aria-hidden={!docked}
	inert={!docked}
>
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
	.section-index a:first-child {
		padding-left: 0;
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
			transform 160ms cubic-bezier(0.76, 0, 0.24, 1),
			opacity 180ms,
			background 160ms;
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
	@media (max-width: 760px) {
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
			padding: 12px 8px;
			transform: translateY(80px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.section-dock a {
			transition: none;
		}
	}
</style>
