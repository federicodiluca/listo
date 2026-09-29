import { Dexie, type EntityTable } from 'dexie';
import {
	defaultSort,
	type Category,
	type Field,
	type Item,
	type List,
	type SyncedRecord
} from './types';

/**
 * The local database (IndexedDB, through Dexie). It is the only source the UI reads
 * from; Google Drive sync, when enabled, keeps it aligned in the background.
 */
export class ListoDatabase extends Dexie {
	lists!: EntityTable<List, 'id'>;
	categories!: EntityTable<Category, 'id'>;
	items!: EntityTable<Item, 'id'>;
	fields!: EntityTable<Field, 'id'>;

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
		// v4: custom fields. A new table (so stores() this time) plus empty defaults on
		// existing records.
		this.version(4)
			.stores({ fields: 'id, listId' })
			.upgrade(async (tx) => {
				await tx
					.table<List>('lists')
					.toCollection()
					.modify((list) => {
						list.expiryWarningDays ??= 7;
					});
				await tx
					.table<Category>('categories')
					.toCollection()
					.modify((category) => {
						category.defaults ??= {};
					});
				await tx
					.table<Item>('items')
					.toCollection()
					.modify((item) => {
						item.extra ??= {};
					});
			});
		// v5: grouping by category becomes its own setting, separate from the sort order.
		// Lists that were sorted "by category" keep their groups, sorted by name inside.
		this.version(5).upgrade((tx) =>
			tx
				.table<List>('lists')
				.toCollection()
				.modify((list) => {
					const legacy = (list.sort as { field: string }).field === 'category';
					list.groupByCategory ??= true;
					if (legacy) list.sort = { field: 'name', direction: 'asc' };
				})
		);
	}
}

export const db = new ListoDatabase();
