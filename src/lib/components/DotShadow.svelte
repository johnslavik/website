<script lang="ts">
	import { DOT, shadowPaths } from '$lib/dot-pattern';
	const id = $props.id();
	const paths = shadowPaths();
</script>

<svg class="dot-shadow" aria-hidden="true" width="100%" height="100%">
	<defs>
		<pattern {id} patternUnits="userSpaceOnUse" width={DOT.pitch * 32} height={DOT.pitch * 32}>
			{#each paths as path (path.opacity)}<path {...path} />{/each}
		</pattern>
	</defs>
	<rect width="100%" height="100%" fill={`url(#${id})`} />
</svg>

<style>
	.dot-shadow {
		position: absolute;
		inset: -88px -72px -88px -100px;
		width: calc(100% + 172px);
		height: calc(100% + 176px);
		fill: #171717;
		opacity: 0.9;
		pointer-events: none;
		mask-image:
			linear-gradient(to right, transparent, #000 17%, #000 83%, transparent),
			linear-gradient(to bottom, transparent, #000 17%, #000 83%, transparent);
		mask-composite: intersect;
	}
	@media (max-width: 760px) {
		.dot-shadow {
			inset: -28px -20px -32px;
			width: calc(100% + 40px);
			height: calc(100% + 60px);
		}
	}
</style>
