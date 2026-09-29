<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import { sync } from '$lib/sync/sync.svelte';
	import { onMount } from 'svelte';

	// Private area: the noindex tag is added to the generated HTML by src/hooks.server.ts.
	// robots.txt must NOT block /app, otherwise crawlers could not read that tag.
	let { children } = $props();

	// One sync controller for the whole app, started when any app page opens
	onMount(() => sync.start());

	// A new version was deployed while the app was open: turn the next in-app navigation
	// into a full page load, so the new code (and service worker) takes over.
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) location.href = to.url.href;
	});
</script>

{@render children()}
