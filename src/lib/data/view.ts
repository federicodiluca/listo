import { normalize } from './items';
import type { Category, Item, ListSort } from './types';

export type ItemFilter = {
	/** Show archived items instead of active ones. */
	archived: boolean;
	/** Selected categories: an item matches if it has at least one. Empty = all. */
	categoryIds: ReadonlySet<string>;
	/** Free text matched against name and note, ignoring case and accents. */
	query: string;
};

export type ItemGroup = {
	/** `null` for the "no category" group. */
	category: Category | null;
	items: Item[];
};

export function filterItems(items: readonly Item[], filter: ItemFilter): Item[] {
	const query = normalize(filter.query);
	return items.filter(
		(item) =>
			(item.archivedAt !== null) === filter.archived &&
			(filter.categoryIds.size === 0 || item.categoryIds.some((c) => filter.categoryIds.has(c))) &&
			(!query || normalize(`${item.name} ${item.note}`).includes(query))
	);
}

const byName = (a: Item, b: Item) =>
	a.name.localeCompare(b.name, 'it', { sensitivity: 'base', numeric: true });

/**
 * Sorts a flat list. Ties are broken by name, so the order is stable and predictable.
 * Items without a quantity always go last, whatever the direction.
 */
export function sortItems(items: readonly Item[], sort: ListSort): Item[] {
	const sign = sort.direction === 'asc' ? 1 : -1;
	return [...items].sort((a, b) => {
		switch (sort.field) {
			case 'addedOn':
				return sign * a.addedOn.localeCompare(b.addedOn) || byName(a, b);
			case 'quantity':
				if (a.quantity === null || b.quantity === null) {
					return (a.quantity === null ? 1 : 0) - (b.quantity === null ? 1 : 0) || byName(a, b);
				}
				return sign * (a.quantity - b.quantity) || byName(a, b);
			case 'name':
			case 'category':
				return sign * byName(a, b);
		}
	});
}

/**
 * Groups items under their categories, in the user's category order (reversed for
 * `desc`), names A→Z inside each group. An item with two categories shows up in both
 * groups; items without categories end up in a final group. Empty groups are dropped.
 */
export function groupByCategory(
	items: readonly Item[],
	categories: readonly Category[],
	direction: ListSort['direction']
): ItemGroup[] {
	const ordered = [...categories].sort((a, b) => a.position - b.position);
	if (direction === 'desc') ordered.reverse();
	const known = new Set(categories.map((c) => c.id));
	const sorted = [...items].sort(byName);
	const groups: ItemGroup[] = ordered.map((category) => ({
		category,
		items: sorted.filter((item) => item.categoryIds.includes(category.id))
	}));
	groups.push({
		category: null,
		items: sorted.filter((item) => !item.categoryIds.some((c) => known.has(c)))
	});
	return groups.filter((group) => group.items.length > 0);
}
