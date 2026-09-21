<script lang="ts">
	let { dark = false, variant = 'a' }: { dark?: boolean; variant?: string } = $props();
</script>

<div
	class="section-composition"
	class:composition-dark={dark}
	class:composition-reverse={variant === 'b'}
>
	<span class="composition-grain" aria-hidden="true"></span>
	<span class="composition-piece composition-step"></span>
	<span class="composition-piece composition-frame"></span>
	<span class="composition-piece composition-offset"></span>
	<span class="composition-piece composition-lines"></span>
	<span class="composition-piece composition-foot"></span>
</div>
