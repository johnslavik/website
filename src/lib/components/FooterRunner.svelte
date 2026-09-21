<script lang="ts">
	import { onMount } from 'svelte';
	let track: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	onMount(() => {
		const context = canvas.getContext('2d');
		if (!context) return;
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
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
			const frame = Math.floor((elapsed / 675) * 40) % 40;
			const assembled = smooth(phase / 0.18) * smooth((1 - phase) / 0.18);
			const x = -30 + phase * (width - 36);
			context.clearRect(0, 0, width, 96);
			context.globalAlpha = smooth((assembled - 0.55) / 0.45);
			context.drawImage(sprite, frame * 192, 0, 192, 192, x, 0, 96, 96);
			context.fillStyle = '#e52a24';
			for (const point of frames[frame]) {
				context.globalAlpha =
					(1 - smooth((assembled - 0.55) / 0.45)) *
					point.alpha *
					Math.min(1, phase * 24, (1 - phase) * 24);
				const spread = (1 - assembled) * point.spread;
				context.fillRect(
					x + point.x + spread * Math.cos(point.x * 1.8),
					point.y + spread * Math.sin(point.y * 2.1),
					2,
					2
				);
			}
			context.globalAlpha = 1;
			request = requestAnimationFrame(draw);
		};
		const update = () => {
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
						if (alpha > 0.2) points.push({ x, y, alpha, spread: 15 + ((x * 17 + y * 31) % 55) });
					}
				return points;
			});
			update();
		};
		sprite.src = '/art/nawczoraj-runner.png';
		const observer = new IntersectionObserver(([entry]) => {
			nearby = entry.isIntersecting;
			update();
		});
		const resize = new ResizeObserver(([entry]) => {
			width = entry.contentRect.width;
			const ratio = Math.min(devicePixelRatio, 2);
			canvas.width = width * ratio;
			canvas.height = 96 * ratio;
			context.setTransform(ratio, 0, 0, ratio, 0, 0);
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
		width: 100%;
		height: 96px;
	}
	@media (prefers-reduced-motion: reduce) {
		.runner-track {
			display: none;
		}
	}
</style>
