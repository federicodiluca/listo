<script lang="ts">
	import { sync } from '$lib/sync/sync.svelte';
	import { onMount } from 'svelte';

	// Private area: the noindex tag is added to the generated HTML by src/hooks.server.ts.
	// robots.txt must NOT block /app, otherwise crawlers could not read that tag.
	let { children } = $props();

	// One sync controller for the whole app, started when any app page opens
	onMount(() => sync.start());
</script>

{@render children()}
