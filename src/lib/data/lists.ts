import { db } from './db';
import { cleanName, firstGrapheme } from './text';
import { defaultSort, type Category, type CategoryDraft, type List, type ListSort } from './types';

const now = () => new Date().toISOString();

function toCategory(listId: string, draft: CategoryDraft, position: number): Category {
	return {
		id: crypto.randomUUID(),
		listId,
		emoji: firstGrapheme(draft.emoji),
		name: cleanName(draft.name),
		color: draft.color,
		position,
		updatedAt: now(),
		deletedAt: null
	};
}

/** Creates a list together with its initial categories; resolves with the list id. */
export async function createList(
	name: string,
	categories: CategoryDraft[],
	sort: ListSort = defaultSort
): Promise<string> {
	const timestamp = now();
	const list: List = {
		id: crypto.randomUUID(),
		name: cleanName(name),
		// plain copy: callers may pass Svelte $state proxies, which IndexedDB can't clone
		sort: { field: sort.field, direction: sort.direction },
		createdAt: timestamp,
		updatedAt: timestamp,
		deletedAt: null
	};
	const rows = categories.map((draft, i) => toCategory(list.id, draft, i));
	await db.transaction('rw', db.lists, db.categories, async () => {
		await db.lists.add(list);
		await db.categories.bulkAdd(rows);
	});
	return list.id;
}

export async function renameList(id: string, name: string): Promise<void> {
	await db.lists.update(id, { name: cleanName(name), updatedAt: now() });
}

export async function setListSort(id: string, sort: ListSort): Promise<void> {
	await db.lists.update(id, {
		sort: { field: sort.field, direction: sort.direction },
		updatedAt: now()
	});
}

/**
 * Deletes a list with everything in it. Records become tombstones (see `deletedAt`):
 * otherwise another device, at the next sync, would bring the list back.
 */
export async function deleteList(id: string): Promise<void> {
	const tombstone = { deletedAt: now(), updatedAt: now() };
	await db.transaction('rw', db.lists, db.categories, db.items, async () => {
		await db.items.where('listId').equals(id).modify(tombstone);
		await db.categories.where('listId').equals(id).modify(tombstone);
		await db.lists.update(id, tombstone);
	});
}

/** Categories of a list, in the user's order. */
export async function getCategories(listId: string): Promise<Category[]> {
	return db.categories
		.where('listId')
		.equals(listId)
		.filter((c) => !c.deletedAt)
		.sortBy('position');
}

export async function addCategory(listId: string, draft: CategoryDraft): Promise<string> {
	return db.transaction('rw', db.categories, async () => {
		const position = (await getCategories(listId)).length;
		const category = toCategory(listId, draft, position);
		await db.categories.add(category);
		return category.id;
	});
}

export async function updateCategory(id: string, changes: Partial<CategoryDraft>): Promise<void> {
	const update: Partial<Category> = { updatedAt: now() };
	if (changes.name !== undefined) update.name = cleanName(changes.name);
	if (changes.emoji !== undefined) update.emoji = firstGrapheme(changes.emoji);
	if (changes.color !== undefined) update.color = changes.color;
	await db.categories.update(id, update);
}

/** Moves a category one place up (-1) or down (+1), swapping it with its neighbour. */
export async function moveCategory(id: string, direction: -1 | 1): Promise<void> {
	await db.transaction('rw', db.categories, async () => {
		const category = await db.categories.get(id);
		if (!category) return;
		const siblings = await getCategories(category.listId);
		const index = siblings.findIndex((c) => c.id === id);
		const neighbour = siblings[index + direction];
		if (!neighbour) return;
		const timestamp = now();
		await db.categories.update(category.id, { position: neighbour.position, updatedAt: timestamp });
		await db.categories.update(neighbour.id, { position: category.position, updatedAt: timestamp });
	});
}

/**
 * Deletes a category and removes it from every item that had it. Items themselves
 * are kept: losing a tag must not lose the food in the freezer.
 */
export async function deleteCategory(id: string): Promise<void> {
	await db.transaction('rw', db.categories, db.items, async () => {
		const category = await db.categories.get(id);
		if (!category) return;
		const timestamp = now();
		await db.items
			.where('categoryIds')
			.equals(id)
			.modify((item) => {
				item.categoryIds = item.categoryIds.filter((c) => c !== id);
				item.updatedAt = timestamp;
			});
		await db.categories.update(id, { deletedAt: timestamp, updatedAt: timestamp });
		// keep positions contiguous (0, 1, 2…) after the gap
		const rest = await getCategories(category.listId);
		await Promise.all(
			rest.map((c, i) =>
				c.position === i
					? undefined
					: db.categories.update(c.id, { position: i, updatedAt: timestamp })
			)
		);
	});
}

export type ListSummary = { list: List; categories: Category[] };

/** Every list, oldest first, each with its categories in order. */
export async function getListSummaries(): Promise<ListSummary[]> {
	const [lists, categories] = await Promise.all([
		db.lists
			.orderBy('createdAt')
			.filter((l) => !l.deletedAt)
			.toArray(),
		db.categories.filter((c) => !c.deletedAt).toArray()
	]);
	return lists.map((list) => ({
		list,
		categories: categories
			.filter((c) => c.listId === list.id)
			.sort((a, b) => a.position - b.position)
	}));
}

/** A list with its categories, or `null` if it doesn't exist (e.g. deleted elsewhere). */
export async function getListSummary(id: string): Promise<ListSummary | null> {
	const list = await db.lists.get(id);
	return list && !list.deletedAt ? { list, categories: await getCategories(id) } : null;
}
