<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { createList } from '$lib/data/lists';
	import { templateGroups, templates, type ListTemplate } from '$lib/data/templates';
	import type { CategoryDraft, FieldDraft } from '$lib/data/types';
	import AppHeader from '$lib/ui/AppHeader.svelte';
	import CategoryChip from '$lib/ui/CategoryChip.svelte';
	import CategoryRow from '$lib/ui/CategoryRow.svelte';
	import FieldRow from '$lib/ui/FieldRow.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import NewCategoryForm from '$lib/ui/NewCategoryForm.svelte';
	import NewFieldForm from '$lib/ui/NewFieldForm.svelte';
	import { onMount } from 'svelte';

	type Keyed<T> = T & { key: string };
	const keyed = <T extends object>(value: T): Keyed<T> => ({ ...value, key: crypto.randomUUID() });

	let template = $state<ListTemplate>();
	let name = $state('');
	// Drafts live only in memory until "Crea lista": each needs a stable key for {#each}
	let drafts = $state<Keyed<CategoryDraft>[]>([]);
	let fieldDrafts = $state<Keyed<FieldDraft>[]>([]);
	let error = $state('');

	function choose(chosen: ListTemplate) {
		template = chosen;
		name = chosen.id === 'vuota' ? '' : chosen.name;
		drafts = chosen.categories.map(keyed);
		fieldDrafts = chosen.fields.map(keyed);
	}

	// Coming from a use-case page ("Crea la lista Congelatore"): start from that template
	onMount(() => {
		const preset = templates.find((t) => t.id === page.url.searchParams.get('modello'));
		if (preset) choose(preset);
	});

	function swap<T>(items: T[], index: number, direction: -1 | 1) {
		const target = index + direction;
		[items[index], items[target]] = [items[target], items[index]];
	}

	async function create(event: SubmitEvent) {
		event.preventDefault();
		try {
			const id = await createList(name, drafts, {
				sort: template?.sort,
				fields: fieldDrafts,
				expiryWarningDays: template?.expiryWarningDays
			});
			// replaceState: "back" from the new list goes to the overview, not to this form
			await goto(resolve('/app/lista/[id]', { id }), { replaceState: true });
		} catch (e) {
			error = e instanceof Error ? e.message : 'Impossibile creare la lista.';
		}
	}
</script>

<svelte:head>
	<title>Nuova lista — Listo</title>
</svelte:head>

<AppHeader title="Nuova lista" back={resolve('/app/liste')} />

<main class="mx-auto max-w-xl px-4 py-6">
	{#if !template}
		<h2 class="text-lg font-semibold">Da dove partiamo?</h2>
		<p class="mt-1 text-muted">Scegli un modello: potrai cambiare tutto subito dopo.</p>
		{#each templateGroups as group (group.id)}
			<h3 class="mt-6 text-sm font-semibold text-muted">{group.label}</h3>
			<ul class="mt-2 grid gap-3 sm:grid-cols-2">
				{#each templates.filter((t) => t.group === group.id) as candidate (candidate.id)}
					<li>
						<button
							class="flex h-full w-full flex-col items-start gap-2 rounded-2xl border border-line bg-surface p-4 text-left"
							onclick={() => choose(candidate)}
						>
							<span class="flex items-center gap-3">
								<span class="grid size-10 place-items-center rounded-xl bg-bg text-accent">
									<Icon name={candidate.icon} size={22} />
								</span>
								<span class="font-semibold">{candidate.name}</span>
							</span>
							<span class="text-sm text-muted">{candidate.description}</span>
							{#if candidate.categories.length}
								<span class="mt-1 flex flex-wrap gap-1">
									{#each candidate.categories.slice(0, 4) as category (category.name)}
										<CategoryChip {category} />
									{/each}
									{#if candidate.categories.length > 4}
										<span class="px-1 py-0.5 text-sm text-muted"
											>+{candidate.categories.length - 4}</span
										>
									{/if}
								</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/each}
	{:else}
		<form id="new-list" onsubmit={create}>
			<label class="block font-semibold" for="list-name">Nome della lista</label>
			<input
				id="list-name"
				class="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-3 text-lg"
				placeholder="Es. Congelatore"
				bind:value={name}
				required
			/>
		</form>

		<h2 class="mt-8 font-semibold">Categorie</h2>
		<p class="mt-1 text-sm text-muted">
			Un elemento potrà stare in più categorie: il minestrone sia in «Verdura» sia in «Piatti
			pronti».
		</p>
		<ul class="mt-2 divide-y divide-line">
			{#each drafts as draft, i (draft.key)}
				<CategoryRow
					category={draft}
					first={i === 0}
					last={i === drafts.length - 1}
					onchange={(changes) => Object.assign(drafts[i], changes)}
					onmove={(direction) => swap(drafts, i, direction)}
					ondelete={() => drafts.splice(i, 1)}
				/>
			{/each}
		</ul>
		<NewCategoryForm
			usedColors={drafts.map((d) => d.color)}
			onadd={(draft) => drafts.push(keyed(draft))}
		/>

		<h2 class="mt-8 font-semibold">Campi</h2>
		<p class="mt-1 text-sm text-muted">
			{fieldDrafts.length
				? 'Informazioni in più per ogni elemento. Togli quelle che non ti servono.'
				: 'Nessun campo extra. Puoi aggiungerne ora o in qualsiasi momento dalle impostazioni.'}
		</p>
		<ul class="mt-2 divide-y divide-line">
			{#each fieldDrafts as field, i (field.key)}
				<FieldRow
					{field}
					first={i === 0}
					last={i === fieldDrafts.length - 1}
					onchange={(changes) => Object.assign(fieldDrafts[i], changes)}
					onmove={(direction) => swap(fieldDrafts, i, direction)}
					ondelete={() => fieldDrafts.splice(i, 1)}
				/>
			{/each}
		</ul>
		<NewFieldForm onadd={(draft) => fieldDrafts.push(keyed(draft))} />

		{#if error}<p class="mt-4 text-danger" role="alert">{error}</p>{/if}

		<div class="mt-8 flex gap-3">
			<button
				type="button"
				class="rounded-xl border border-line px-5 py-3"
				onclick={() => (template = undefined)}>Cambia modello</button
			>
			<button
				form="new-list"
				class="flex-1 rounded-xl bg-primary px-5 py-3 font-medium text-on-primary disabled:opacity-40"
				disabled={!name.trim()}>Crea lista</button
			>
		</div>
	{/if}
</main>
