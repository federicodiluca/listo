import 'fake-indexeddb/auto';
import { Dexie } from 'dexie';
import { describe, expect, it } from 'vitest';
import { ListoDatabase } from './db';
import { defaultSort } from './types';

describe('schema migrations', () => {
	it('v1 → v4 adds sort order, tombstones and custom field defaults', async () => {
		// A database as the first release left it: version 1, lists without `sort`
		const old = new Dexie('migration-test');
		old.version(1).stores({
			lists: 'id, createdAt',
			categories: 'id, listId',
			items: 'id, listId, *categoryIds'
		});
		await old.table('lists').add({
			id: 'l1',
			name: 'Congelatore',
			createdAt: '2026-09-27T10:00:00.000Z',
			updatedAt: '2026-09-27T10:00:00.000Z'
		});
		old.close();

		const current = new ListoDatabase('migration-test');
		const list = await current.lists.get('l1');
		expect(list?.sort).toEqual(defaultSort);
		expect(list?.name).toBe('Congelatore');
		expect(list?.deletedAt).toBeNull(); // v3
		expect(list?.expiryWarningDays).toBe(7); // v4
		expect(await current.fields.count()).toBe(0); // v4: new table
		current.close();
	});
});
