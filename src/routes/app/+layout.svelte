<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<!-- Private area: never indexed. robots.txt must NOT block /app, otherwise
	     crawlers could not read this tag and might still index bare URLs. -->
	<meta name="robots" content="noindex" />
</svelte:head>

{@render children()}
