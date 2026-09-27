import { Dexie, type EntityTable } from 'dexie';
import type { Category, Item, List } from './types';

/**
 * The local database (IndexedDB, through Dexie). It is the only source the UI reads
 * from; Google Drive sync, when enabled, keeps it aligned in the background.
 */
export class ListoDatabase extends Dexie {
	lists!: EntityTable<List, 'id'>;
	categories!: EntityTable<Category, 'id'>;
	items!: EntityTable<Item, 'id'>;

	constructor(name = 'listo') {
		super(name);
		// Only indexed fields are listed: the first one is the primary key, the others
		// can be used in where()/orderBy(). `*categoryIds` is a multi-entry index: an
		// item is indexed once per category it belongs to, so "all items tagged X" is a
		// direct lookup. Every other field is stored but not indexed.
		this.version(1).stores({
			lists: 'id, createdAt',
			categories: 'id, listId',
			items: 'id, listId, *categoryIds'
		});
	}
}

export const db = new ListoDatabase();
