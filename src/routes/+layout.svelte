<script lang="ts">
	import { browser } from '$app/environment';
	import { installer } from '$lib/install.svelte';
	import './layout.css';

	let { children } = $props();

	// As early as possible: the browser can announce installability right after load
	if (browser) installer.listen();
</script>

{@render children()}
