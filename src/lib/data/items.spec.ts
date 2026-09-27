import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { today } from './dates';
import { db } from './db';
import {
	addItem,
	archiveItem,
	deleteItem,
	formatQuantity,
	getItem,
	getItems,
	matchByName,
	normalize,
	parseQuantity,
	restoreItem,
	toggleItemCategory,
	updateItem
} from './items';
import { createList, deleteCategory, getCategories } from './lists';

let listId: string;

beforeEach(async () => {
	await db.delete();
	await db.open();
	listId = await createList('Congelatore', [
		{ emoji: '🥦', name: 'Verdura', color: 'verde' },
		{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio' }
	]);
});

describe('parseQuantity', () => {
	it('accepts the Italian decimal comma and empty input', () => {
		expect(parseQuantity('3')).toBe(3);
		expect(parseQuantity('0,5')).toBe(0.5);
		expect(parseQuantity(' 1.25 ')).toBe(1.25);
		expect(parseQuantity('')).toBeNull();
	});

	it('rejects nonsense and negatives', () => {
		expect(() => parseQuantity('tanti')).toThrow();
		expect(() => parseQuantity('-1')).toThrow();
	});
});

describe('formatQuantity', () => {
	it('uses the Italian decimal comma and the unit', () => {
		expect(formatQuantity(3, 'porzioni')).toBe('3 porzioni');
		expect(formatQuantity(0.5, 'kg')).toBe('0,5 kg');
		expect(formatQuantity(2, '')).toBe('2');
		expect(formatQuantity(null, 'g')).toBe('');
	});
});

describe('normalize', () => {
	it('ignores case, accents and outer spaces', () => {
		expect(normalize('  Caffè ')).toBe('caffe');
		expect(normalize('PERCHÉ')).toBe('perche');
	});
});

describe('items', () => {
	it('adds an item dated today with nothing else set', async () => {
		const id = await addItem(listId, ' Minestrone ');
		expect(await getItem(id)).toMatchObject({
			name: 'Minestrone',
			listId,
			quantity: null,
			unit: '',
			categoryIds: [],
			addedOn: today(),
			archivedAt: null
		});
	});

	it('updates the editable fields and validates them', async () => {
		const [veg, ready] = await getCategories(listId);
		const id = await addItem(listId, 'Minestrone');
		await updateItem(id, {
			quantity: 3,
			unit: ' porzioni ',
			addedOn: '2026-09-20',
			note: ' con farro ',
			categoryIds: [veg.id, ready.id, veg.id]
		});
		expect(await getItem(id)).toMatchObject({
			quantity: 3,
			unit: 'porzioni',
			addedOn: '2026-09-20',
			note: 'con farro',
			categoryIds: [veg.id, ready.id]
		});
		await expect(updateItem(id, { addedOn: '2026-02-30' })).rejects.toThrow();
		await expect(updateItem(id, { quantity: -2 })).rejects.toThrow();
		await expect(updateItem(id, { name: ' ' })).rejects.toThrow();
	});

	it('toggles categories on and off', async () => {
		const [veg] = await getCategories(listId);
		const id = await addItem(listId, 'Piselli');
		await toggleItemCategory(id, veg.id);
		expect((await getItem(id))?.categoryIds).toEqual([veg.id]);
		await toggleItemCategory(id, veg.id);
		expect((await getItem(id))?.categoryIds).toEqual([]);
	});

	it('archives and brings back an item, keeping its categories', async () => {
		const [veg] = await getCategories(listId);
		const id = await addItem(listId, 'Piselli');
		await updateItem(id, {
			categoryIds: [veg.id],
			quantity: 2,
			unit: 'sacchetti',
			addedOn: '2026-01-10'
		});

		await archiveItem(id);
		expect((await getItem(id))?.archivedAt).not.toBeNull();

		await restoreItem(id);
		expect(await getItem(id)).toMatchObject({
			archivedAt: null,
			addedOn: today(),
			quantity: null,
			unit: 'sacchetti',
			categoryIds: [veg.id]
		});
	});

	it('deletes an item', async () => {
		const id = await addItem(listId, 'Piselli');
		await deleteItem(id);
		expect(await getItem(id)).toBeNull();
		expect(await getItems(listId)).toEqual([]);
	});

	it('keeps items when one of their categories is deleted', async () => {
		const [veg, ready] = await getCategories(listId);
		const id = await addItem(listId, 'Minestrone');
		await updateItem(id, { categoryIds: [veg.id, ready.id] });
		await deleteCategory(veg.id);
		expect((await getItem(id))?.categoryIds).toEqual([ready.id]);
	});
});

describe('matchByName', () => {
	it('finds active and archived items, prefix matches first', async () => {
		const soup = await addItem(listId, 'Minestrone');
		const pesto = await addItem(listId, 'Pesto di minestra');
		await archiveItem(soup);
		const items = await getItems(listId);

		const matches = matchByName(items, 'mines');
		expect(matches.map((m) => [m.item.id, m.archived])).toEqual([
			[soup, true],
			[pesto, false]
		]);
		expect(matchByName(items, '  ')).toEqual([]);
	});
});
