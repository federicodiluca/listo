<script lang="ts">
	import { site } from '$lib/site';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external links only -->
<footer class="mx-auto max-w-xl px-4 py-8 text-center text-sm opacity-70">
	<p>
		Un progetto di
		<a class="underline" href={site.author.url}>{site.author.name}</a>
		· <a class="underline" href={site.author.projectsUrl}>scopri gli altri progetti</a>
	</p>
	<p class="mt-1">
		Contatti: <a class="underline" href="mailto:{site.contactEmail}">{site.contactEmail}</a>
	</p>
</footer>
