<script lang="ts">
	import Icon from '@iconify/svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, slide } from 'svelte/transition';
	let envelopeVisible = $state(false);
</script>

<div class="mt-[calc(var(--shrunk-banner-height)+min(8%,2rem))] flex w-full flex-wrap items-center justify-evenly gap-16 p-[min(5rem,8%)]">
	<article class="prose prose-xl prose-a:font-bold">
		<h1>Bartosz Sławecki</h1>

		<p>
			I build reliable software, teach programming, and contribute to open source.<br />
			<strong>
				<i>
					Curious about collaboration?<br>
					<a
						onmouseenter={() => (envelopeVisible = true)}
						onmouseleave={() => (envelopeVisible = false)}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="E-mail"
						href="mailto:bartosz@slawecki.dev"
					>
						Let’s talk!
					</a>
					{#if envelopeVisible}
						<span transition:fade={{ duration: 1000 }}>
							<Icon
								width="32"
								icon={prefersReducedMotion.current ? 'mdi:email' : 'line-md:email'}
								class="inline-block transition-all duration-500"
							/>
						</span>
					{/if}
				</i>
			</strong>
		</p>
	</article>

	<article class="prose prose-sm">
		<h1>Connect with me</h1>

		<nav class="flex justify-evenly gap-2">
			<a
				target="_blank"
				rel="noopener noreferrer"
				aria-label="LinkedIn"
				href="https://linkedin.com/in/johnslavik"
				><Icon
					width="64"
					icon={prefersReducedMotion.current ? 'mdi:linkedin' : 'line-md:linkedin'}
					class="transition-all duration-500 hover:scale-105"
				/></a
			>
			<a
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
				href="https://github.com/johnslavik"
				><Icon
					width="64"
					icon={prefersReducedMotion.current ? 'mdi:github' : 'line-md:github'}
					class="transition-all duration-500 hover:scale-105"
				/></a
			>
			<!-- <a target="_blank" rel="noopener noreferrer" aria-label="Mastodon" href="https://fosstodon.org/@bswck"
			><Icon
				width="64"
				icon={prefersReducedMotion.current ? "mdi:mastodon" : "line-md:mastodon"}
				class="transition-all duration-500 hover:scale-105"
			/></a
		> -->
		</nav>
	</article>
</div>
