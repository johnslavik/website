<script lang="ts">
	import Icon from '@iconify/svelte';
	import { prefersReducedMotion } from 'svelte/motion';
</script>

<div
	class="mx-auto flex flex-wrap items-center justify-evenly gap-16 p-[min(2rem,8%)] lg:w-(--banner-w)"
>
	<article class="prose break-normal prose-a:font-bold">
		<h1>Bartosz Sławecki</h1>

		<p>
			I build reliable software, teach programming, and contribute to open source.<br />
			<strong>
				<i class="group">
					Curious about collaboration?<br />
					<a
						target="_blank"
						rel="noopener noreferrer"
						class="text-xl"
						aria-label="E-mail"
						href="mailto:bartosz@slawecki.dev"
					>
						Let’s talk!
					</a>
					<Icon
						width="24"
						icon={prefersReducedMotion.current ? 'mdi:email' : 'line-md:email'}
						class="inline-block opacity-0 transition-all duration-500 group-hover:opacity-100"
					/>
				</i>
			</strong>
		</p>
	</article>
</div>
