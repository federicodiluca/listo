import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './db';
import {
	addField,
	deleteField,
	getFields,
	moveField,
	setCategoryDefault,
	setItemField,
	updateField
} from './fields';
import { addItem, getItem, toggleItemCategory } from './items';
import { createList, getCategories, getListSummary } from './lists';

let listId: string;

beforeEach(async () => {
	await db.delete();
	await db.open();
	listId = await createList('Congelatore', [{ emoji: '🥩', name: 'Carne', color: 'rosso' }], {
		fields: [{ name: 'Si conserva per', type: 'duration', expiry: true, showInList: false }]
	});
});

describe('fields', () => {
	it('are created with the list, from the template', async () => {
		const summary = await getListSummary(listId);
		expect(summary?.fields.map((f) => [f.name, f.type, f.expiry])).toEqual([
			['Si conserva per', 'duration', true]
		]);
	});

	it('can be added, renamed, reordered and deleted', async () => {
		const brand = await addField(listId, {
			name: 'Marca',
			type: 'text',
			expiry: false,
			showInList: true
		});
		await updateField(brand, { name: 'Produttore' });
		await moveField(brand, -1);
		expect((await getFields(listId)).map((f) => f.name)).toEqual(['Produttore', 'Si conserva per']);

		await deleteField(brand);
		expect((await getFields(listId)).map((f) => [f.name, f.position])).toEqual([
			['Si conserva per', 0]
		]);
		expect((await db.fields.get(brand))?.deletedAt).not.toBeNull(); // tombstone, for sync
	});

	it('only date and duration fields can be expiries', async () => {
		const id = await addField(listId, {
			name: 'Marca',
			type: 'text',
			expiry: true,
			showInList: false
		});
		expect((await db.fields.get(id))?.expiry).toBe(false);
		await updateField(id, { expiry: true });
		expect((await db.fields.get(id))?.expiry).toBe(false);
	});

	it('store and clear item values, rejecting invalid ones', async () => {
		const [duration] = await getFields(listId);
		const itemId = await addItem(listId, 'Minestrone');
		await setItemField(itemId, duration, { amount: 3, unit: 'months' });
		expect((await getItem(itemId))?.extra).toEqual({
			[duration.id]: { amount: 3, unit: 'months' }
		});
		await expect(setItemField(itemId, duration, { amount: -1, unit: 'days' })).rejects.toThrow();
		await setItemField(itemId, duration, null);
		expect((await getItem(itemId))?.extra).toEqual({});
	});
});

describe('category defaults', () => {
	it('fill empty fields when the category is added, never overwriting', async () => {
		const [duration] = await getFields(listId);
		const [meat] = await getCategories(listId);
		await setCategoryDefault(meat.id, duration, { amount: 6, unit: 'months' });

		const chicken = await addItem(listId, 'Pollo');
		await toggleItemCategory(chicken, meat.id);
		expect((await getItem(chicken))?.extra[duration.id]).toEqual({ amount: 6, unit: 'months' });

		const ragu = await addItem(listId, 'Ragù');
		await setItemField(ragu, duration, { amount: 2, unit: 'months' });
		await toggleItemCategory(ragu, meat.id);
		expect((await getItem(ragu))?.extra[duration.id]).toEqual({ amount: 2, unit: 'months' });
	});

	it('can be cleared', async () => {
		const [duration] = await getFields(listId);
		const [meat] = await getCategories(listId);
		await setCategoryDefault(meat.id, duration, { amount: 6, unit: 'months' });
		await setCategoryDefault(meat.id, duration, null);
		expect((await db.categories.get(meat.id))?.defaults).toEqual({});
	});
});
