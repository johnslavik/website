<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<main class="site-shell" style="padding-top: 80px; padding-bottom: 80px">
	<h1>{page.status}</h1>
	<p style="margin: 24px 0">
		{page.status === 404 ? 'This page does not exist.' : 'Something went wrong. Please try again.'}
	</p>
	<a class="primary-link" href={resolve('/')}>Back to the website</a>
</main>
