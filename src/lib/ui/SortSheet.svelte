<script lang="ts" module>
	import type { ListSort, SortField } from '$lib/data/types';

	const options: { field: SortField; label: string; asc: string; desc: string }[] = [
		{
			field: 'addedOn',
			label: 'Data di aggiunta',
			asc: 'Prima i più vecchi',
			desc: 'Prima i più recenti'
		},
		{ field: 'name', label: 'Nome', asc: 'Dalla A alla Z', desc: 'Dalla Z alla A' },
		{ field: 'quantity', label: 'Quantità', asc: 'Prima i meno', desc: 'Prima i più' },
		{
			field: 'category',
			label: 'Categoria',
			asc: 'Nell’ordine delle categorie',
			desc: 'In ordine inverso'
		},
		{ field: 'expiry', label: 'Scadenza', asc: 'Prima le più vicine', desc: 'Prima le più lontane' }
	];

	/** Short description of a sort, for the toolbar button. */
	export function describeSort(sort: ListSort): string {
		return options.find((o) => o.field === sort.field)?.label ?? '';
	}
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		sort,
		onchange,
		hasExpiry
	}: {
		sort: ListSort;
		onchange: (sort: ListSort) => void;
		/** The "by expiry" order only makes sense if the list has an expiry field. */
		hasExpiry: boolean;
	} = $props();

	const available = $derived(options.filter((o) => o.field !== 'expiry' || hasExpiry));

	const id = $props.id();
	let sheet: HTMLElement;

	function choose(next: ListSort) {
		onchange(next);
		sheet.hidePopover();
	}
</script>

<button
	popovertarget="{id}-sort"
	class="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm"
	aria-label="Ordina per: {describeSort(sort)}. Cambia ordinamento"
>
	<Icon name="sort" size={18} />
	<span class="hidden sm:inline">{describeSort(sort)}</span>
</button>

<div popover id="{id}-sort" class="sheet" bind:this={sheet}>
	<h2 class="mb-2 font-semibold">Ordina per</h2>
	<ul class="divide-y divide-line">
		{#each available as option (option.field)}
			{@const selected = option.field === sort.field}
			<li class="py-3">
				<p class:font-semibold={selected}>{option.label}</p>
				<div class="mt-2 grid grid-cols-2 gap-2">
					{#each ['asc', 'desc'] as const as direction (direction)}
						{@const active = selected && sort.direction === direction}
						<button
							class="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm {active
								? 'border-transparent bg-primary text-on-primary'
								: 'border-line'}"
							aria-pressed={active}
							onclick={() => choose({ field: option.field, direction })}
						>
							{#if active}<Icon name="check" size={16} />{/if}
							{option[direction]}
						</button>
					{/each}
				</div>
			</li>
		{/each}
	</ul>
</div>
