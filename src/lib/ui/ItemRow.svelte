<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatAge, formatDate } from '$lib/data/dates';
	import { describeExpiry, expiryOf, expiryStatus, formatFieldValue } from '$lib/data/field-values';
	import { formatQuantity } from '$lib/data/items';
	import type { Category, Field, Item } from '$lib/data/types';
	import CategoryBadge from './CategoryBadge.svelte';

	let {
		item,
		categories,
		fields,
		warningDays
	}: {
		item: Item;
		categories: ReadonlyMap<string, Category>;
		fields: readonly Field[];
		warningDays: number;
	} = $props();

	const tags = $derived(
		item.categoryIds.map((id) => categories.get(id)).filter((c): c is Category => c !== undefined)
	);
	const details = $derived(
		[
			formatQuantity(item.quantity, item.unit),
			item.archivedAt
				? `archiviato il ${formatDate(item.archivedAt.slice(0, 10))}`
				: formatAge(item.addedOn),
			// fields shown in the list; expiry fields have their own badge instead
			...fields
				.filter((f) => f.showInList && !f.expiry)
				.map((f) => formatFieldValue(f, item.extra[f.id]))
		]
			.filter(Boolean)
			.join(' · ')
	);
	const expiry = $derived(item.archivedAt ? null : expiryOf(item, fields));
	const status = $derived(expiry ? expiryStatus(expiry, warningDays) : null);
</script>

<a
	href={resolve('/app/lista/[id]/elemento/[itemId]', { id: item.listId, itemId: item.id })}
	class="flex items-center gap-3 px-4 py-3"
>
	<span class="min-w-0 flex-1">
		<span class="block truncate font-medium">{item.name}</span>
		<span class="block truncate text-sm text-muted">
			{details}{#if tags.length}<span class="sr-only">
					· {tags.map((t) => t.name).join(', ')}</span
				>{/if}
		</span>
		{#if expiry && status}
			<span
				class="mt-1 inline-block rounded-md px-1.5 py-0.5 text-xs font-medium {status === 'expired'
					? 'bg-danger/15 text-danger'
					: status === 'soon'
						? 'bg-accent/20 text-ink'
						: 'bg-bg text-muted'}">{describeExpiry(expiry)}</span
			>
		{/if}
	</span>
	{#if tags.length}
		<span class="flex shrink-0 -space-x-1.5">
			{#each tags.slice(0, 4) as category (category.id)}
				<CategoryBadge {category} />
			{/each}
		</span>
	{/if}
</a>
