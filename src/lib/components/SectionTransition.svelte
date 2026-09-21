<script lang="ts">
	import { onMount } from 'svelte';
	let { reverse = false }: { reverse?: boolean } = $props();
	let element: HTMLDivElement;
	type Brick = { x: number; y: number; width: number; height: number; opacity: number };
	let width = $state(1200);
	let height = $state(240);
	const tailHeight = $derived(Math.max(420, Math.min(760, width * 0.55)));
	const pitch = 8;
	const courseHeight = 14;
	function smooth(value: number) {
		const t = Math.max(0, Math.min(1, value));
		return t * t * (3 - 2 * t);
	}
	const courses = $derived.by(() => {
		const rows = Math.ceil(height / courseHeight);
		return Array.from({ length: rows }, (_, row) => {
			const y = row * courseHeight;
			const bricks: Brick[] = [];
			for (let column = -1; column <= Math.ceil(width / pitch); column++) {
				const x = column * pitch;
				const u = x / width;
				const edge =
					0.16 + 0.075 * Math.sin(u * Math.PI * 4 + 0.6) + 0.045 * Math.sin(u * Math.PI * 9);
				const depth = y / height;
				const assembly = smooth((depth - edge) / (0.88 - edge));
				if (assembly <= 0 || assembly === 1) continue;
				const gapX = 6.25 * (1 - assembly);
				const gapY = 9 * (1 - assembly);
				const overlap = assembly === 1 ? 0.25 : 0;
				bricks.push({
					x: x + gapX / 2,
					y: y + gapY / 2,
					width: pitch - gapX + overlap,
					height: courseHeight - gapY + overlap,
					opacity: smooth(assembly * 2.5)
				});
			}
			return {
				bricks,
				drift: Math.max(0, 1 - row / (rows * 0.8)) ** 2 * 28
			};
		});
	});
	const remnants = $derived.by(() => {
		const bricks: Brick[] = [];
		const rows = Math.ceil(tailHeight / courseHeight);
		for (let row = 0; row < rows; row++) {
			const extent = width * 0.22 * (1 - smooth(row / rows));
			const breadth = Math.ceil(extent / pitch);
			const gap = 1.75 + (row / rows) * 4;
			for (let column = 0; column < breadth; column++) {
				bricks.push({
					x: column * pitch,
					y: row * courseHeight,
					width: pitch - gap,
					height: courseHeight - gap,
					opacity:
						0.08 * (1 - smooth(row / rows)) * (1 - smooth((column * pitch) / Math.max(1, extent)))
				});
			}
		}
		return bricks;
	});
	onMount(() => {
		const observer = new ResizeObserver(([entry]) => {
			width = entry.contentRect.width;
			height = entry.contentRect.height;
		});
		observer.observe(element);
		const reduced = matchMedia('(prefers-reduced-motion: reduce)');
		let frame = 0;
		function paint() {
			frame = 0;
			const rect = element.getBoundingClientRect();
			const progress = Math.max(
				-1,
				Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight)
			);
			element.style.setProperty('--gather', `${reduced.matches ? 0 : Math.max(0, -progress)}`);
		}
		function update() {
			if (!frame) frame = requestAnimationFrame(paint);
		}
		addEventListener('scroll', update, { passive: true });
		addEventListener('resize', update);
		reduced.addEventListener('change', update);
		paint();
		return () => {
			observer.disconnect();
			removeEventListener('scroll', update);
			removeEventListener('resize', update);
			reduced.removeEventListener('change', update);
			cancelAnimationFrame(frame);
		};
	});
</script>

<div class="section-transition" class:reverse bind:this={element} aria-hidden="true">
	<svg class="masonry" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
		{#each courses as course, index (index)}
			<g style={`transform: translateY(calc(var(--gather, 0) * ${-course.drift}px))`}>
				{#each course.bricks as brick (brick)}<rect
						{...brick}
						y={reverse ? height - brick.y - brick.height : brick.y}
					/>{/each}
			</g>
		{/each}
	</svg>
	<svg class="masonry-remnants" viewBox={`0 0 ${width} ${tailHeight}`} preserveAspectRatio="none">
		{#each remnants as brick (brick)}<rect {...brick} />{/each}
		<g transform={`translate(${width} 0) scale(-1 1)`} class="red-remnants">
			{#each remnants as brick (brick)}<rect {...brick} />{/each}
		</g>
	</svg>
</div>

<style>
	.section-transition {
		--gather: 0;
	}
	svg {
		position: absolute;
		width: 100%;
		left: 0;
		pointer-events: none;
	}
	.masonry {
		top: 0;
		height: 100%;
		fill: var(--to);
		background: linear-gradient(to bottom, transparent 62%, #111 88%);
		overflow: hidden;
	}
	.reverse {
		background: #fff;
	}
	.reverse .masonry {
		fill: #111;
		background: linear-gradient(to bottom, #111 12%, transparent 38%);
	}
	.masonry-remnants {
		top: 100%;
		height: clamp(420px, 55vw, 760px);
		fill: var(--from);
		overflow: hidden;
	}
	.red-remnants {
		fill: #e52a24;
	}
	@media (prefers-reduced-motion: reduce) {
		.masonry g {
			transform: none !important;
		}
	}
</style>
