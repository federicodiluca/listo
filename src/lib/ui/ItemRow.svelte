<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatAge, formatDate } from '$lib/data/dates';
	import { formatQuantity } from '$lib/data/items';
	import type { Category, Item } from '$lib/data/types';
	import CategoryBadge from './CategoryBadge.svelte';

	let { item, categories }: { item: Item; categories: ReadonlyMap<string, Category> } = $props();

	const tags = $derived(
		item.categoryIds.map((id) => categories.get(id)).filter((c): c is Category => c !== undefined)
	);
	const details = $derived(
		[
			formatQuantity(item.quantity, item.unit),
			item.archivedAt
				? `archiviato il ${formatDate(item.archivedAt.slice(0, 10))}`
				: formatAge(item.addedOn)
		]
			.filter(Boolean)
			.join(' · ')
	);
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
	</span>
	{#if tags.length}
		<span class="flex shrink-0 -space-x-1.5">
			{#each tags.slice(0, 4) as category (category.id)}
				<CategoryBadge {category} />
			{/each}
		</span>
	{/if}
</a>
