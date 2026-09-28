import { Dexie, type EntityTable } from 'dexie';
import { defaultSort, type Category, type Item, type List, type SyncedRecord } from './types';

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
		// v2: lists remember their sort order. Indexes are unchanged, so no stores();
		// upgrade() runs once, on databases still at v1, before anything else can read.
		this.version(2).upgrade((tx) =>
			tx
				.table<List>('lists')
				.toCollection()
				.modify((list) => {
					list.sort ??= defaultSort;
				})
		);
		// v3: deletions become tombstones (deletedAt), so they can be synced to other devices
		this.version(3).upgrade(async (tx) => {
			for (const table of ['lists', 'categories', 'items']) {
				await tx
					.table<SyncedRecord>(table)
					.toCollection()
					.modify((record) => {
						record.deletedAt ??= null;
					});
			}
		});
	}
}

export const db = new ListoDatabase();
