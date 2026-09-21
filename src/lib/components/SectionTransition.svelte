<script lang="ts">
	import { onMount } from 'svelte';
	let { reverse = false }: { reverse?: boolean } = $props();
	let element: HTMLDivElement;
	type Brick = { x: number; y: number; width: number; height: number; opacity: number };
	let width = $state(1200);
	let height = $state(240);
	const tailHeight = $derived(Math.max(420, Math.min(760, width * 0.55)));
	const pitch = 7;
	function noise(column: number, row: number, seed = 0) {
		let n = Math.imul(column + 1024, 374761393) ^ Math.imul(row + seed * 97, 668265263);
		n = Math.imul(n ^ (n >>> 13), 1274126177);
		return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
	}
	const courseHeight = pitch;
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
				const wave = 0.045 * Math.sin(u * Math.PI * 4 + 0.6) + 0.025 * Math.sin(u * Math.PI * 9);
				const depth = y / height;
				const assembly = smooth((depth - wave * Math.sin(depth * Math.PI)) / 0.96);
				if (noise(column, row) > Math.min(1, assembly * 2.4)) continue;
				const size =
					3 + (pitch - 2) * smooth((assembly - 0.12 + noise(column, row, 8) * 0.13) / 0.85);
				bricks.push({
					x: x + (pitch - size) / 2,
					y: y + (pitch - size) / 2,
					width: size,
					height: size,
					opacity: Math.min(1, assembly * 2.2)
				});
			}
			return {
				bricks,
				y,
				base: smooth((row / rows - 0.5) / 0.46),
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

			for (let column = 0; column < breadth; column++) {
				if (noise(column, row, 5) > 0.65) continue;
				const size = 3;
				bricks.push({
					x: column * pitch + 2,
					y: row * courseHeight + 2,
					width: size,
					height: size,
					opacity:
						0.3 *
						(0.4 + noise(column, row, 4) * 0.6) *
						(1 - smooth(row / rows)) *
						(1 - smooth((column * pitch) / Math.max(1, extent)))
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
		<rect x="0" y={reverse ? -1 : height * 0.98} {width} height={height * 0.02 + 2} />
		{#each courses as course (course.y)}
			<rect
				x="0"
				y={reverse ? height - course.y - pitch : course.y}
				{width}
				height={pitch + 1}
				opacity={course.base}
			/>
		{/each}
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
		shape-rendering: geometricPrecision;
		overflow: hidden;
	}
	.reverse {
		background: #fff;
	}
	.reverse .masonry {
		fill: #111;
		background: none;
	}
	.masonry-remnants {
		top: 100%;
		height: clamp(420px, 55vw, 760px);
		fill: #888;
		overflow: hidden;
	}
	.reverse .masonry-remnants,
	.reverse .red-remnants {
		fill: #171717;
	}
	.red-remnants {
		fill: #888;
	}
	@media (prefers-reduced-motion: reduce) {
		.masonry g {
			transform: none !important;
		}
	}
</style>
