<script lang="ts">
	import SiteFooter from '$lib/site-ui/SiteFooter.svelte';
	import SiteHeader from '$lib/site-ui/SiteHeader.svelte';

	let { children } = $props();
</script>

<!-- Public, indexable pages: prerendered to static HTML (see the root +layout.ts) -->
<SiteHeader />
{@render children()}
<SiteFooter />
