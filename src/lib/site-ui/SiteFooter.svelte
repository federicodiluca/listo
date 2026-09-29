<script lang="ts">
	import { resolve } from '$app/paths';
	import { useCasePages } from '$lib/seo/pages';
	import { site } from '$lib/site';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external links and paths from the page list -->
<footer class="mt-16 border-t border-line">
	<div class="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
		<div>
			<p class="flex items-center gap-2 font-bold">
				<img src="/favicon.svg" alt="" class="size-6" width="24" height="24" /> Listo
			</p>
			<p class="mt-2 text-muted">Liste con categorie multiple. Gratis, senza account.</p>
		</div>
		<nav aria-label="Usi di Listo">
			<p class="font-semibold">Per cosa usarlo</p>
			<ul class="mt-2 flex flex-col gap-1.5 text-muted">
				{#each useCasePages as useCase (useCase.path)}
					<li><a class="hover:text-ink" href={useCase.path}>{useCase.label}</a></li>
				{/each}
			</ul>
		</nav>
		<div>
			<p class="font-semibold">Progetto</p>
			<ul class="mt-2 flex flex-col gap-1.5 text-muted">
				<li><a class="hover:text-ink" href={resolve('/(sito)/privacy')}>Privacy</a></li>
				<li><a class="hover:text-ink" href="mailto:{site.contactEmail}">{site.contactEmail}</a></li>
				<li>
					<a class="hover:text-ink" href="https://github.com/federicodiluca/listo"
						>Codice su GitHub</a
					>
				</li>
			</ul>
		</div>
	</div>
	<p class="border-t border-line px-4 py-6 text-center text-sm text-muted">
		Un progetto di
		<a class="underline hover:text-ink" href={site.author.url}>{site.author.name}</a>
		·
		<a class="underline hover:text-ink" href={site.author.projectsUrl}>scopri gli altri progetti</a>
	</p>
</footer>
