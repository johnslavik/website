<script lang="ts">
	import { Lexer, type Token } from 'marked';
	let { text }: { text: string } = $props();
	const tokens = $derived(Lexer.lexInline(text));
</script>

{#snippet inline(nodes: Token[])}
	{#each nodes as token, index (index)}
		{#if token.type === 'codespan'}<code>{token.text}</code>
		{:else if token.type === 'strong'}<strong>{@render inline(token.tokens ?? [])}</strong>
		{:else if token.type === 'em'}<em>{@render inline(token.tokens ?? [])}</em>
		{:else if token.type === 'del'}<s>{@render inline(token.tokens ?? [])}</s>
		{:else if token.type === 'link'}{@render inline(token.tokens ?? [])}
		{:else if token.type === 'escape' || token.type === 'text'}{token.text}
		{:else}{token.raw}{/if}
	{/each}
{/snippet}
{@render inline(tokens)}
