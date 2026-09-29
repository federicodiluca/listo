import type { ListoDatabase } from '$lib/data/db';
import type { Category, Field, Item, List, SyncedRecord } from '$lib/data/types';
import { FORMAT_VERSION, fromSheet, toSheet, type Snapshot } from './format';
import { mergeSnapshots, newer } from './merge';

/**
 * Where the shared copy lives. In the app it's the Google Sheet; in tests an
 * in-memory stand-in. The engine only knows these two operations.
 */
export interface SheetStore {
	read(): Promise<Record<string, string[][]>>;
	/** `previousRowCounts` lets the store clear rows left over from a longer version. */
	write(tabs: Record<string, string[][]>, previousRowCounts: Record<string, number>): Promise<void>;
}

export class NewerFormatError extends Error {
	constructor() {
		super('Il foglio è stato scritto da una versione più recente di Listo: aggiorna la pagina.');
	}
}

export type SyncResult = {
	/** Records received from the sheet and saved locally. */
	received: number;
	/** Whether the sheet was rewritten. */
	sent: boolean;
	/** Sheet rows ignored because they were unreadable. */
	skipped: number;
	/**
	 * Newest `updatedAt` in the synced state: local changes after it are not synced yet.
	 * Not the clock time, which would hide edits made while waiting for the network.
	 */
	syncedUpTo: string;
};

/** Everything in the local database, tombstones included. */
async function readLocal(db: ListoDatabase): Promise<Snapshot> {
	const [lists, categories, items, fields] = await Promise.all([
		db.lists.toArray(),
		db.categories.toArray(),
		db.items.toArray(),
		db.fields.toArray()
	]);
	return { lists, categories, items, fields };
}

/**
 * Saves records coming from the sheet. The network round trip takes a moment, and the
 * user may have edited something meanwhile: inside the transaction each record is
 * compared again with the current local copy, and only a newer one is written.
 */
async function applyLocal(db: ListoDatabase, incoming: Snapshot): Promise<number> {
	let written = 0;
	await db.transaction('rw', [db.lists, db.categories, db.items, db.fields], async () => {
		const apply = async <T extends SyncedRecord>(
			table: { get(id: string): PromiseLike<T | undefined>; put(record: T): PromiseLike<unknown> },
			records: T[]
		) => {
			for (const record of records) {
				const current = await table.get(record.id);
				if (!current || newer(current, record) === record) {
					await table.put(record);
					written++;
				}
			}
		};
		await apply<List>(db.lists, incoming.lists);
		await apply<Category>(db.categories, incoming.categories);
		await apply<Item>(db.items, incoming.items);
		await apply<Field>(db.fields, incoming.fields);
	});
	return written;
}

/**
 * One full sync: read the sheet, merge with the local database, save what is newer
 * locally, and rewrite the sheet only if it is missing something.
 */
export async function syncOnce(
	db: ListoDatabase,
	store: SheetStore,
	now = new Date().toISOString()
): Promise<SyncResult> {
	const tabs = await store.read();
	const { snapshot: remote, skipped, format } = fromSheet(tabs);
	if (format > FORMAT_VERSION) throw new NewerFormatError();

	const local = await readLocal(db);
	const { merged, toLocal, remoteChanged } = mergeSnapshots(local, remote, now);

	const received = await applyLocal(db, toLocal);
	// unreadable rows are rewritten from the good data, which also cleans them up
	const sent = remoteChanged || skipped > 0;
	if (sent) {
		const counts = Object.fromEntries(
			Object.entries(tabs).map(([tab, rows]) => [tab, rows.length])
		);
		await store.write(toSheet(merged), counts);
	}
	const syncedUpTo = [
		...merged.lists,
		...merged.categories,
		...merged.items,
		...merged.fields
	].reduce((latest, r) => (r.updatedAt > latest ? r.updatedAt : latest), '');
	return { received, sent, skipped, syncedUpTo };
}
