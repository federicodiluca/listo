import { normalize } from './items';
import type { CalendarDate, Category, Item, ListSort } from './types';

export type ItemFilter = {
	/** Show archived items instead of active ones. */
	archived: boolean;
	/** Selected categories: an item matches if it has at least one. Empty = all. */
	categoryIds: ReadonlySet<string>;
	/** Free text matched against name and note, ignoring case and accents. */
	query: string;
	/** When set, only items passing it are kept (e.g. "expiring soon"). */
	only?: (item: Item) => boolean;
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
			(!query || normalize(`${item.name} ${item.note}`).includes(query)) &&
			(!filter.only || filter.only(item))
	);
}

const byName = (a: Item, b: Item) =>
	a.name.localeCompare(b.name, 'it', { sensitivity: 'base', numeric: true });

/** Items without a value always go last, whatever the direction. */
function nullsLast<T>(a: T | null, b: T | null, compare: (a: T, b: T) => number): number {
	if (a === null || b === null) return (a === null ? 1 : 0) - (b === null ? 1 : 0);
	return compare(a, b);
}

/**
 * Sorts a flat list. Ties are broken by name, so the order is stable and predictable.
 * `expiry` gives each item's expiry date, for the "by expiry" order.
 */
export function sortItems(
	items: readonly Item[],
	sort: ListSort,
	expiry: (item: Item) => CalendarDate | null = () => null
): Item[] {
	const sign = sort.direction === 'asc' ? 1 : -1;
	return [...items].sort((a, b) => {
		switch (sort.field) {
			case 'addedOn':
				return sign * a.addedOn.localeCompare(b.addedOn) || byName(a, b);
			case 'quantity':
				return nullsLast(a.quantity, b.quantity, (x, y) => sign * (x - y)) || byName(a, b);
			case 'expiry':
				return nullsLast(expiry(a), expiry(b), (x, y) => sign * x.localeCompare(y)) || byName(a, b);
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
