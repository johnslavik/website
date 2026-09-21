<script lang="ts">
	import { onMount } from 'svelte';
	let track: HTMLDivElement;
	let visible = $state(false);
	onMount(() => {
		let nearby = false;
		const update = () => {
			visible = nearby && !document.hidden;
		};
		const observer = new IntersectionObserver(([entry]) => {
			nearby = entry.isIntersecting;
			update();
		});
		const resize = new ResizeObserver(([entry]) => {
			track.style.setProperty('--run-duration', `${(entry.contentRect.width + 200) / 120}s`);
			track.style.setProperty('--run-distance', `${entry.contentRect.width + 200}px`);
		});
		observer.observe(track);
		resize.observe(track);
		document.addEventListener('visibilitychange', update);
		return () => {
			observer.disconnect();
			resize.disconnect();
			document.removeEventListener('visibilitychange', update);
		};
	});
</script>

<div class="business-signoff">
	<span>My software business</span>
	<div class="runner-track" class:runner-visible={visible} bind:this={track} aria-hidden="true">
		<div class="runner-crossing">
			<span class="runner-sprite"
				><img
					class="runner-frames"
					src="/art/nawczoraj-runner.png"
					alt=""
					width="7680"
					height="192"
				/></span
			>
		</div>
	</div>
	<a target="_blank" rel="noopener noreferrer" href="https://nawczoraj.com/">nawczoraj.com</a>
</div>
