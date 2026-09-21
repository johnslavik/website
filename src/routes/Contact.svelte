<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import SectionComposition from '$lib/components/SectionComposition.svelte';
	let section: HTMLElement;
	let Form = $state<Component>();
	let failed = $state(false);
	onMount(() => {
		let disposed = false;
		let loading = false;
		async function load() {
			if (loading || Form) return;
			loading = true;
			try {
				const module = await import('./ContactForm.svelte');
				if (!disposed) Form = module.default;
			} catch {
				if (!disposed) failed = true;
			} finally {
				loading = false;
			}
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					observer.disconnect();
					void load();
				}
			},
			{ rootMargin: '600px' }
		);
		observer.observe(section);
		section.addEventListener('focusin', load);
		return () => {
			disposed = true;
			observer.disconnect();
			section.removeEventListener('focusin', load);
		};
	});
</script>

<section bind:this={section} id="contact" class="contact-section" aria-labelledby="contact-title">
	<span class="contact-outline"></span><span class="square-field contact-squares" aria-hidden="true"
	></span>
	<div class="contact-heading">
		<h2 id="contact-title">Get in touch</h2>
		<p>Send me a message or suggest a time to talk.</p>
		<img
			class="contact-portrait"
			src="https://avatars.githubusercontent.com/u/64036239?s=640&amp;v=4"
			alt="Bartosz Sławecki"
			width="640"
			height="640"
			loading="lazy"
		/>
	</div>
	{#if Form}<Form />{:else}
		<div class="contact-panel deferred-contact" aria-busy={!failed}>
			<p role="status">{failed ? 'The contact form could not load.' : 'Loading contact form…'}</p>
			<a href="mailto:bartosz@nawczoraj.com">bartosz@nawczoraj.com</a>
		</div>
	{/if}
	<SectionComposition dark />
</section>

<style>
	.deferred-contact {
		min-height: 620px;
		align-self: start;
	}
</style>
