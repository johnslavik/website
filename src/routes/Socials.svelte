<script lang="ts">
	import Icon from '@iconify/svelte';
	import { prefersReducedMotion } from 'svelte/motion';
</script>

<h1 class="text-sm">Connect with me</h1>

<nav class="flex justify-evenly gap-2">
	<a
		target="_blank"
		rel="noopener noreferrer"
		aria-label="LinkedIn"
		href="https://linkedin.com/in/johnslavik"
		><Icon
			width="46"
			icon={prefersReducedMotion.current ? 'mdi:linkedin' : 'line-md:linkedin'}
			class="not-motion-reduce:transition-all duration-500 hover:scale-105"
		/></a
	>
	<a
		target="_blank"
		rel="noopener noreferrer"
		aria-label="GitHub"
		href="https://github.com/johnslavik"
		><Icon
			width="46"
			icon={prefersReducedMotion.current ? 'mdi:github' : 'line-md:github'}
			class="not-motion-reduce:transition-all duration-500 hover:scale-105"
		/></a
	>
	<!-- <a target="_blank" rel="noopener noreferrer" aria-label="Mastodon" href="https://fosstodon.org/@bswck"
		><Icon
			width="64"
			icon={prefersReducedMotion.current ? "mdi:mastodon" : "line-md:mastodon"}
			class="not-motion-reduce:transition-all duration-500 hover:scale-105"
		/></a
	> -->
</nav>
