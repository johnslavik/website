<script lang="ts">
	import { onMount } from 'svelte';
	let track: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	onMount(() => {
		const context = canvas.getContext('2d');
		if (!context) return;
		const motion = matchMedia('(prefers-reduced-motion: reduce), (max-width: 767px)');
		const sprite = new Image();
		let frames: { x: number; y: number; spread: number; alpha: number }[][] = [];
		let width = 0,
			nearby = false,
			request = 0,
			elapsed = 0,
			previous = 0,
			disposed = false;
		const smooth = (n: number) => {
			const t = Math.max(0, Math.min(1, n));
			return t * t * (3 - 2 * t);
		};
		const draw = (now: number) => {
			request = 0;
			if (disposed || !nearby || document.hidden || motion.matches || !frames.length) {
				previous = 0;
				return;
			}
			if (previous) elapsed += Math.min(now - previous, 50);
			previous = now;
			const duration = Math.max(4500, ((width + 96) / 100) * 1000);
			const phase = (elapsed % duration) / duration;
			const burstDuration = 650 / duration;
			const entering = phase < burstDuration;
			const arrival = Math.min(1, phase / burstDuration);
			const departure = Math.max(0, (phase - 1 + burstDuration) / burstDuration);
			const scatter = entering ? (1 - arrival) ** 3 : 1 - (1 - departure) ** 3;
			const assembled = 1 - scatter;
			const frame = Math.floor((elapsed / 675) * 40) % 40;
			const travel = phase;
			const x = 24 + travel * Math.max(0, width - 144);
			context.clearRect(-160, -80, width + 320, 256);
			context.globalAlpha = smooth((assembled - 0.55) / 0.45);
			context.drawImage(sprite, frame * 192, 0, 192, 192, x, 0, 96, 96);
			context.fillStyle = '#e52a24';
			for (const point of frames[frame]) {
				context.globalAlpha =
					(1 - smooth((assembled - 0.55) / 0.45)) *
					point.alpha *
					Math.min(1, arrival * 5) *
					(1 - departure ** 2);
				const spread = scatter * point.spread;
				const angle =
					Math.atan2(point.y - 48, point.x - 48) + Math.sin(point.x * 17 + point.y * 31) * 0.6;
				context.fillRect(
					x + point.x + spread * Math.cos(angle),
					point.y + spread * Math.sin(angle) * 0.32,
					2,
					2
				);
			}
			context.globalAlpha = 1;
			request = requestAnimationFrame(draw);
		};
		const update = () => {
			if (nearby && !motion.matches && !sprite.getAttribute('src'))
				sprite.src = '/art/nawczoraj-runner.png';
			if (!request) request = requestAnimationFrame(draw);
		};
		sprite.onload = () => {
			if (disposed) return;
			const buffer = document.createElement('canvas');
			buffer.width = 96;
			buffer.height = 96;
			const sample = buffer.getContext('2d', { willReadFrequently: true });
			if (!sample) return;
			frames = Array.from({ length: 40 }, (_, frame) => {
				sample.clearRect(0, 0, 96, 96);
				sample.drawImage(sprite, frame * 192, 0, 192, 192, 0, 0, 96, 96);
				const pixels = sample.getImageData(0, 0, 96, 96).data;
				const points = [];
				for (let y = 0; y < 96; y += 3)
					for (let x = 0; x < 96; x += 3) {
						const alpha = pixels[(y * 96 + x) * 4 + 3] / 255;
						if (alpha > 0.2) points.push({ x, y, alpha, spread: 55 + ((x * 17 + y * 31) % 90) });
					}
				return points;
			});
			update();
		};

		const observer = new IntersectionObserver(([entry]) => {
			nearby = entry.isIntersecting;
			update();
		});
		const resize = new ResizeObserver(([entry]) => {
			width = entry.contentRect.width;
			const ratio = Math.min(devicePixelRatio, 2);
			canvas.width = (width + 320) * ratio;
			canvas.height = 256 * ratio;
			context.setTransform(ratio, 0, 0, ratio, 160 * ratio, 80 * ratio);
			update();
		});
		observer.observe(track);
		resize.observe(track);
		document.addEventListener('visibilitychange', update);
		motion.addEventListener('change', update);
		return () => {
			disposed = true;
			cancelAnimationFrame(request);
			observer.disconnect();
			resize.disconnect();
			document.removeEventListener('visibilitychange', update);
			motion.removeEventListener('change', update);
		};
	});
</script>

<div class="business-signoff">
	<span>My software business</span>
	<div class="runner-track" bind:this={track} aria-hidden="true">
		<canvas bind:this={canvas}></canvas>
	</div>
	<a target="_blank" rel="noopener noreferrer" href="https://nawczoraj.com/">nawczoraj.com</a>
</div>

<style>
	canvas {
		display: block;
		position: absolute;
		left: -160px;
		top: -80px;
		width: calc(100% + 320px);
		max-width: none;
		height: 256px;
		pointer-events: none;
	}
	@media (prefers-reduced-motion: reduce), (max-width: 767px) {
		.runner-track {
			display: none;
		}
	}
</style>
