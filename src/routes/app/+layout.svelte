<script lang="ts">
	// Private area: the noindex tag is added to the generated HTML by src/hooks.server.ts.
	// robots.txt must NOT block /app, otherwise crawlers could not read that tag.
	let { children } = $props();
</script>

{@render children()}
