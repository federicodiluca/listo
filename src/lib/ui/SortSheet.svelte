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
		hasExpiry,
		grouped,
		ongroup
	}: {
		sort: ListSort;
		onchange: (sort: ListSort) => void;
		/** The "by expiry" order only makes sense if the list has an expiry field. */
		hasExpiry: boolean;
		/** Grouping by category; undefined when the list has no categories. */
		grouped?: boolean;
		ongroup: (grouped: boolean) => void;
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
	{#if grouped !== undefined}
		<label class="mb-4 flex items-center gap-3 rounded-2xl border border-line p-4">
			<span class="flex-1">
				<strong class="block">Raggruppa per categoria</strong>
				<span class="text-sm text-muted">
					Ogni elemento compare una volta, sotto la sua prima categoria.
				</span>
			</span>
			<input
				type="checkbox"
				class="size-6 accent-(--color-accent)"
				checked={grouped}
				onchange={(e) => ongroup(e.currentTarget.checked)}
			/>
		</label>
	{/if}
	<h2 class="mb-2 font-semibold">{grouped ? 'Dentro ogni gruppo, ordina per' : 'Ordina per'}</h2>
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
