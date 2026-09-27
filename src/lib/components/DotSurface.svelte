<script lang="ts">
	import { onMount } from 'svelte';
	import { DOT, dotViewport, dotExclusion, shadowPaths } from '$lib/dot-pattern';
	let { dark = false }: { dark?: boolean } = $props();
	const id = $props.id();
	const paths = shadowPaths();
	let element: HTMLDivElement;
	let exclusions = $state<ReturnType<typeof dotExclusion>[]>([]);
	let viewportWidth = $state(0);
	let size = $state({ width: 0, height: 0 });
	onMount(() => {
		const parent = element.parentElement!;
		const covers = () => [
			...parent.querySelectorAll<HTMLElement>(
				'.photo-frame, .contact-photo, .activity-item:first-child, .talk-cover, .contact-panel'
			)
		];
		function update() {
			viewportWidth = document.documentElement.clientWidth;
			const bounds = element.getBoundingClientRect();
			const left = bounds.left + (bounds.width - viewportWidth) / 2;
			size = dotViewport(viewportWidth, bounds.height);
			exclusions = covers().map((cover) => {
				const rect = cover.getBoundingClientRect();
				return dotExclusion(rect.left - left, rect.top - bounds.top, rect.width, rect.height);
			});
		}
		const observer = new ResizeObserver(update);
		observer.observe(parent);
		observer.observe(element);
		for (const cover of covers()) observer.observe(cover);
		addEventListener('resize', update);
		parent.addEventListener('animationend', update);
		parent.addEventListener('transitionend', update);
		update();
		return () => {
			observer.disconnect();
			removeEventListener('resize', update);
			parent.removeEventListener('animationend', update);
			parent.removeEventListener('transitionend', update);
		};
	});
</script>

<div
	class="dot-surface"
	class:dark
	bind:this={element}
	style:width={viewportWidth ? `${viewportWidth}px` : '100%'}
	aria-hidden="true"
>
	<svg width={size.width} height={size.height}>
		<defs
			><pattern {id} patternUnits="userSpaceOnUse" width={DOT.pitch * 32} height={DOT.pitch * 32}>
				{#each paths as path (path.opacity)}<path {...path} />{/each}
			</pattern>
			<mask
				id={`${id}-clear`}
				maskUnits="userSpaceOnUse"
				x="0"
				y="0"
				width={size.width}
				height={size.height}
			>
				<rect width={size.width} height={size.height} fill="white" />
				{#each exclusions as box, i (i)}<rect {...box} fill="black" />{/each}
			</mask></defs
		>
		<rect width={size.width} height={size.height} fill={`url(#${id})`} mask={`url(#${id}-clear)`} />
	</svg>
</div>

<style>
	.dot-surface {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 100vw;
		transform: translateX(-50%);
		pointer-events: none;
		z-index: -1;
		color: #171717;
		opacity: 0.24;
	}
	.dark {
		color: #888;
		opacity: 0.12;
	}
	svg {
		display: block;
		fill: currentColor;
	}
</style>
