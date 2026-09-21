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
				const edge =
					0.16 + 0.075 * Math.sin(u * Math.PI * 4 + 0.6) + 0.045 * Math.sin(u * Math.PI * 9);
				const depth = y / height;
				const assembly = smooth((depth - edge) / (0.88 - edge));
				if (assembly <= 0 || assembly === 1) continue;
				const cluster = 0.8 + 0.2 * Math.sin(u * 19 + depth * 8);
				if (noise(column, row) > Math.min(1, assembly * cluster * 1.6)) continue;
				const size = 2.5 + noise(column, row, 1) * 1.5 + 9 * smooth((assembly - 0.5) / 0.45);
				bricks.push({
					x: x + (pitch - size) / 2 + (noise(column, row, 2) - 0.5) * 3,
					y: y + (pitch - size) / 2 + (noise(column, row, 3) - 0.5) * 3,
					width: size,
					height: size,
					opacity:
						smooth(assembly * 2) *
						(0.4 + noise(column, row, 4) * 0.6 + smooth((assembly - 0.5) / 0.3))
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

			for (let column = 0; column < breadth; column++) {
				if (noise(column, row, 5) > 0.65) continue;
				const size = 2.5 + noise(column, row, 1) * 1.5;
				bricks.push({
					x: column * pitch + noise(column, row, 2) * 3,
					y: row * courseHeight + noise(column, row, 3) * 3,
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
		background: linear-gradient(to bottom, transparent 88%, #111 98%);
		overflow: hidden;
	}
	.reverse {
		background: #fff;
	}
	.reverse .masonry {
		fill: #111;
		background: linear-gradient(to bottom, #111 2%, transparent 12%);
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
