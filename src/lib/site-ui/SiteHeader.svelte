<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { useCasePages } from '$lib/seo/pages';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- use-case paths come from the page list -->
<header class="border-b border-line">
	<div class="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4">
		<a href={resolve('/')} class="flex items-center gap-2 text-lg font-bold">
			<img src="/favicon.svg" alt="" class="size-8" width="32" height="32" />
			Listo
		</a>
		<nav class="hidden flex-1 gap-5 text-sm text-muted md:flex" aria-label="Casi d'uso">
			{#each useCasePages as useCase (useCase.path)}
				<a
					href={useCase.path}
					class="hover:text-ink"
					aria-current={page.url.pathname === useCase.path ? 'page' : undefined}
					class:text-ink={page.url.pathname === useCase.path}>{useCase.label}</a
				>
			{/each}
		</nav>
		<a
			href={resolve('/app')}
			class="ml-auto rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary md:ml-0"
			>Apri Listo</a
		>
	</div>
</header>
