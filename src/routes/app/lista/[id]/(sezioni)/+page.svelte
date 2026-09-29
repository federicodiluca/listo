<script lang="ts">
	import { resolve } from '$app/paths';
	import { getListContext } from '$lib/data/list-context';
	import { setListSort } from '$lib/data/lists';
	import { expiryOf, expiryStatus } from '$lib/data/field-values';
	import { colorValue } from '$lib/data/palette';
	import type { Category, Item } from '$lib/data/types';
	import { filterItems, groupByCategory, sortItems } from '$lib/data/view';
	import Icon from '$lib/ui/Icon.svelte';
	import ItemRow from '$lib/ui/ItemRow.svelte';
	import QuickAdd from '$lib/ui/QuickAdd.svelte';
	import SortSheet from '$lib/ui/SortSheet.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import type { Snapshot } from './$types';

	const context = getListContext();
	const list = $derived(context.summary.list);
	const categories = $derived(context.summary.categories);
	const byId = $derived(new Map(categories.map((c) => [c.id, c])));

	let query = $state('');
	let archived = $state(false);
	let expiring = $state(false);
	const selected = new SvelteSet<string>();

	type Filters = { query: string; archived: boolean; expiring: boolean; selected: string[] };

	// Restores filters when coming back from an item page (browser history)
	export const snapshot: Snapshot<Filters> = {
		capture: () => ({ query, archived, expiring, selected: [...selected] }),
		restore: (value) => {
			query = value.query;
			archived = value.archived;
			expiring = value.expiring ?? false;
			selected.clear();
			for (const id of value.selected) selected.add(id);
		}
	};

	const fields = $derived(context.summary.fields);
	const hasExpiry = $derived(fields.some((f) => f.expiry));
	const expiryFor = (item: Item) => expiryOf(item, fields);
	/** Expired, or expiring within the list's warning threshold. */
	const isExpiring = (item: Item) => {
		const expiry = expiryFor(item);
		return expiry !== null && expiryStatus(expiry, list.expiryWarningDays) !== 'ok';
	};
	const expiringCount = $derived(
		context.items.filter((i) => !i.archivedAt && isExpiring(i)).length
	);

	const visible = $derived(
		filterItems(context.items, {
			archived,
			categoryIds: selected,
			query,
			only: expiring && !archived ? isExpiring : undefined
		})
	);
	const grouped = $derived(list.sort.field === 'category');
	const groups = $derived(grouped ? groupByCategory(visible, categories, list.sort.direction) : []);
	const sorted = $derived(grouped ? [] : sortItems(visible, list.sort, expiryFor));
	const filtering = $derived(query.trim() !== '' || selected.size > 0 || (expiring && !archived));
	/** Items in the current view (active or archived) before filters, for "3 su 12". */
	const total = $derived(context.items.filter((i) => (i.archivedAt !== null) === archived).length);

	function toggle(category: Category) {
		if (selected.has(category.id)) selected.delete(category.id);
		else selected.add(category.id);
	}

	function clearFilters() {
		query = '';
		expiring = false;
		selected.clear();
	}
</script>

<svelte:head>
	<title>{list.name} — Listo</title>
</svelte:head>

<main class="mx-auto max-w-xl py-4">
	<div class="flex gap-2 px-4">
		<label class="relative min-w-0 flex-1">
			<span
				class="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-muted"
			>
				<Icon name="search" size={18} />
			</span>
			<span class="sr-only">Cerca</span>
			<input
				type="search"
				class="h-10 w-full rounded-xl border border-line bg-surface pr-3 pl-9"
				placeholder="Cerca…"
				bind:value={query}
			/>
		</label>
		<SortSheet sort={list.sort} {hasExpiry} onchange={(sort) => setListSort(list.id, sort)} />
		<button
			class="grid size-10 shrink-0 place-items-center rounded-xl border {archived
				? 'border-transparent bg-primary text-on-primary'
				: 'border-line bg-surface'}"
			aria-pressed={archived}
			aria-label="Mostra archiviati"
			onclick={() => (archived = !archived)}
		>
			<Icon name="archive" size={18} />
		</button>
	</div>

	{#if categories.length || (hasExpiry && !archived)}
		<div
			class="mt-3 flex gap-2 overflow-x-auto px-4 pb-1"
			role="group"
			aria-label="Filtra per categoria o scadenza"
		>
			{#if hasExpiry && !archived}
				<button
					class="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm {expiring
						? 'border-accent bg-accent/20'
						: 'border-line'}"
					aria-pressed={expiring}
					onclick={() => (expiring = !expiring)}
				>
					In scadenza
					<span
						class="rounded-full px-1.5 text-xs {expiringCount
							? 'bg-accent text-on-primary'
							: 'bg-bg'}">{expiringCount}</span
					>
				</button>
			{/if}
			{#each categories as category (category.id)}
				{@const on = selected.has(category.id)}
				<button
					class="inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-sm"
					style:--c={colorValue(category.color)}
					style:border-color={on ? 'var(--c)' : 'var(--color-line)'}
					style:background={on ? 'color-mix(in oklab, var(--c) 22%, transparent)' : 'transparent'}
					aria-pressed={on}
					onclick={() => toggle(category)}
				>
					{#if category.emoji}<span aria-hidden="true">{category.emoji}</span>{/if}
					{category.name}
				</button>
			{/each}
		</div>
	{/if}

	{#if archived}
		<p class="mt-4 px-4 text-sm text-muted">Elementi archiviati: aprili per rimetterli in lista.</p>
	{/if}

	{#if visible.length === 0}
		<section class="mt-12 px-8 text-center text-muted">
			{#if filtering}
				<p>Nessun elemento corrisponde ai filtri.</p>
				<button class="mt-3 underline" onclick={clearFilters}>Togli i filtri</button>
			{:else if archived}
				<p>Nessun elemento archiviato.</p>
			{:else}
				<p class="font-medium text-ink">La lista è vuota</p>
				<p class="mt-1">Aggiungi il primo elemento dalla barra qui sotto.</p>
				{#if !categories.length}
					<a
						href={resolve('/app/lista/[id]/(sezioni)/categorie', { id: list.id })}
						class="mt-3 inline-block underline">Prima crea qualche categoria</a
					>
				{/if}
			{/if}
		</section>
	{:else if grouped}
		{#each groups as group (group.category?.id ?? 'none')}
			<section class="mt-4">
				<h2 class="flex items-center gap-2 px-4 text-sm font-semibold text-muted">
					{#if group.category}
						<span class="size-2.5 rounded-full" style:background={colorValue(group.category.color)}
						></span>
						{group.category.emoji}
						{group.category.name}
					{:else}
						Senza categoria
					{/if}
					<span class="font-normal">· {group.items.length}</span>
				</h2>
				<ul class="mt-1 divide-y divide-line border-y border-line bg-surface">
					{#each group.items as item (item.id)}
						<li>
							<ItemRow {item} categories={byId} {fields} warningDays={list.expiryWarningDays} />
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{:else}
		<p class="mt-4 px-4 text-sm text-muted">
			{visible.length === 1 ? '1 elemento' : `${visible.length} elementi`}
			{#if filtering}su {total}{/if}
		</p>
		<ul class="mt-1 divide-y divide-line border-y border-line bg-surface">
			{#each sorted as item (item.id)}
				<li>
					<ItemRow {item} categories={byId} {fields} warningDays={list.expiryWarningDays} />
				</li>
			{/each}
		</ul>
	{/if}
</main>

{#if !archived}
	<QuickAdd listId={list.id} items={context.items} />
{/if}
