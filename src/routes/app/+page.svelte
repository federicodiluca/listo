<script lang="ts">
	import { resolve } from '$app/paths';
	import { live } from '$lib/data/live.svelte';
	import { getListSummaries } from '$lib/data/lists';
	import AppHeader from '$lib/ui/AppHeader.svelte';
	import CategoryChip from '$lib/ui/CategoryChip.svelte';
	import Icon from '$lib/ui/Icon.svelte';

	const summaries = live(() => null, getListSummaries);
</script>

<svelte:head>
	<title>Le mie liste — Listo</title>
</svelte:head>

<AppHeader title="Le mie liste" />

<main class="mx-auto max-w-xl px-4 py-6">
	{#if summaries.current?.length === 0}
		<section class="mt-10 text-center">
			<p class="text-5xl" aria-hidden="true">🏷️</p>
			<h2 class="mt-4 text-xl font-semibold">Nessuna lista, per ora</h2>
			<p class="mx-auto mt-2 max-w-sm text-muted">
				Crea una lista e scegli le sue categorie: ogni elemento potrà stare in più categorie
				insieme.
			</p>
			<a
				href={resolve('/app/nuova')}
				class="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-on-primary"
			>
				<Icon name="plus" /> Crea la tua prima lista
			</a>
		</section>
	{:else if summaries.current}
		<ul class="flex flex-col gap-3">
			{#each summaries.current as { list, categories } (list.id)}
				<li>
					<a
						href={resolve('/app/lista/[id]', { id: list.id })}
						class="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4"
					>
						<div class="min-w-0 flex-1">
							<h2 class="truncate font-semibold">{list.name}</h2>
							{#if categories.length}
								<div
									class="mt-2 flex gap-1.5 overflow-hidden mask-r-from-80%"
									aria-label="Categorie"
								>
									{#each categories as category (category.id)}
										<CategoryChip {category} />
									{/each}
								</div>
							{:else}
								<p class="mt-1 text-sm text-muted">Nessuna categoria</p>
							{/if}
						</div>
						<span class="text-muted"><Icon name="chevron" /></span>
					</a>
				</li>
			{/each}
		</ul>
		<a
			href={resolve('/app/nuova')}
			class="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-line p-4 font-medium text-muted"
		>
			<Icon name="plus" /> Nuova lista
		</a>
	{/if}
</main>
