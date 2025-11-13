<script lang="ts">
  import { page } from '$app/state';

  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';

  onMount(() => {
    setTimeout(() => {
      window.location.href = '/';
    }, 5000);
  });
</script>

<a href="/" class="justify-self-center prose prose-md m-auto text-center">
  <h1>{page.status}</h1>
  <p>We're going back... <Icon class="inline-block" icon="hugeicons:arrow-turn-backward" /></p>
</a>
