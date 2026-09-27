import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import {
	addCategory,
	createList,
	deleteCategory,
	deleteList,
	getCategories,
	moveCategory,
	renameList,
	updateCategory
} from './lists';
import { templates } from './templates';
import type { Item } from './types';

beforeEach(async () => {
	await db.delete();
	await db.open();
});

function item(listId: string, categoryIds: string[]): Item {
	const timestamp = new Date().toISOString();
	return {
		id: crypto.randomUUID(),
		listId,
		name: 'Minestrone',
		quantity: 3,
		unit: 'porzioni',
		categoryIds,
		addedOn: '2026-09-27',
		note: '',
		archivedAt: null,
		createdAt: timestamp,
		updatedAt: timestamp
	};
}

describe('lists', () => {
	it('creates a list with the categories of a template, in order', async () => {
		const freezer = templates.find((t) => t.id === 'congelatore')!;
		const id = await createList('  Congelatore   di casa ', freezer.categories);

		expect((await db.lists.get(id))?.name).toBe('Congelatore di casa');
		const categories = await getCategories(id);
		expect(categories.map((c) => c.name)).toEqual(freezer.categories.map((c) => c.name));
		expect(categories.map((c) => c.position)).toEqual([0, 1, 2, 3, 4, 5]);
	});

	it('rejects an empty name', async () => {
		await expect(createList('   ', [])).rejects.toThrow();
		await expect(db.lists.count()).resolves.toBe(0);
	});

	it('renames a list', async () => {
		const id = await createList('Dispensa', []);
		await renameList(id, 'Dispensa cantina');
		expect((await db.lists.get(id))?.name).toBe('Dispensa cantina');
	});

	it('deletes a list with its categories and items, leaving other lists alone', async () => {
		const doomed = await createList('A', [{ emoji: '', name: 'x', color: 'blu' }]);
		const kept = await createList('B', [{ emoji: '', name: 'y', color: 'blu' }]);
		await db.items.bulkAdd([item(doomed, []), item(kept, [])]);

		await deleteList(doomed);

		expect(await db.lists.get(doomed)).toBeUndefined();
		expect(await getCategories(doomed)).toEqual([]);
		expect(await db.items.where('listId').equals(doomed).count()).toBe(0);
		expect(await getCategories(kept)).toHaveLength(1);
		expect(await db.items.where('listId').equals(kept).count()).toBe(1);
	});
});

describe('categories', () => {
	it('appends new categories at the end', async () => {
		const listId = await createList('L', [{ emoji: '🥩', name: 'Carne', color: 'rosso' }]);
		await addCategory(listId, { emoji: '🐟', name: 'Pesce', color: 'azzurro' });
		expect((await getCategories(listId)).map((c) => [c.name, c.position])).toEqual([
			['Carne', 0],
			['Pesce', 1]
		]);
	});

	it('keeps only the first emoji', async () => {
		const listId = await createList('L', []);
		const id = await addCategory(listId, { emoji: '🥦🥕', name: 'Verdura', color: 'verde' });
		expect((await db.categories.get(id))?.emoji).toBe('🥦');
	});

	it('updates name, emoji and color', async () => {
		const listId = await createList('L', []);
		const id = await addCategory(listId, { emoji: '', name: 'Verdure', color: 'grigio' });
		await updateCategory(id, { name: 'Verdura', emoji: '🥦', color: 'verde' });
		expect(await db.categories.get(id)).toMatchObject({
			name: 'Verdura',
			emoji: '🥦',
			color: 'verde'
		});
	});

	it('moves categories up and down, ignoring moves past the ends', async () => {
		const listId = await createList('L', [
			{ emoji: '', name: 'A', color: 'blu' },
			{ emoji: '', name: 'B', color: 'blu' },
			{ emoji: '', name: 'C', color: 'blu' }
		]);
		const [a, , c] = await getCategories(listId);

		await moveCategory(c.id, -1);
		await moveCategory(a.id, -1);
		expect((await getCategories(listId)).map((x) => x.name)).toEqual(['A', 'C', 'B']);
	});

	it('deleting a category untags items but keeps them, and closes the gap', async () => {
		const listId = await createList('L', [
			{ emoji: '🥦', name: 'Verdura', color: 'verde' },
			{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio' },
			{ emoji: '🥩', name: 'Carne', color: 'rosso' }
		]);
		const [veg, ready, meat] = await getCategories(listId);
		const soup = item(listId, [veg.id, ready.id]);
		await db.items.add(soup);

		await deleteCategory(veg.id);

		expect((await db.items.get(soup.id))?.categoryIds).toEqual([ready.id]);
		expect((await getCategories(listId)).map((c) => [c.id, c.position])).toEqual([
			[ready.id, 0],
			[meat.id, 1]
		]);
	});
});

describe('multi-category lookup', () => {
	it('finds an item under each of its categories', async () => {
		const listId = await createList('L', [
			{ emoji: '🥦', name: 'Verdura', color: 'verde' },
			{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio' }
		]);
		const [veg, ready] = await getCategories(listId);
		const soup = item(listId, [veg.id, ready.id]);
		await db.items.add(soup);

		const underVeg = await db.items.where('categoryIds').equals(veg.id).toArray();
		const underReady = await db.items.where('categoryIds').equals(ready.id).toArray();
		expect(underVeg.map((i) => i.id)).toEqual([soup.id]);
		expect(underReady.map((i) => i.id)).toEqual([soup.id]);
	});
});
