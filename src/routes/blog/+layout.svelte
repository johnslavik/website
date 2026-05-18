<script lang="ts">
	import '../../app.css';
	let { children } = $props();
</script>

<header class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
	<nav class="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3 text-sm">
		<a href="/" class="font-semibold hover:underline">John Slavik</a>
		<a href="/blog" class="text-gray-500 hover:text-gray-900 hover:underline">Blog</a>
	</nav>
</header>

{@render children()}
