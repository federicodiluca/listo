import type { SyncedRecord } from '$lib/data/types';
import type { Snapshot } from './format';

/** JSON with sorted keys: equal content gives equal strings, whatever the key order. */
function canonical(value: unknown): string {
	return JSON.stringify(value, (_key, v) =>
		v && typeof v === 'object' && !Array.isArray(v)
			? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
			: v
	);
}

export const sameRecord = (a: unknown, b: unknown) => canonical(a) === canonical(b);

/**
 * Last write wins: the version with the most recent `updatedAt`. ISO timestamps in UTC
 * compare correctly as strings. On an exact tie the content decides, so that every
 * device picks the same winner and they converge instead of flip-flopping.
 */
export function newer<T extends SyncedRecord>(a: T, b: T): T {
	if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt ? a : b;
	return canonical(a) >= canonical(b) ? a : b;
}

export type TableMerge<T> = {
	merged: T[];
	/** Records the local database must store (new or newer than the local copy). */
	toLocal: T[];
	/** Whether the sheet is missing something, i.e. needs to be rewritten. */
	remoteChanged: boolean;
};

export function mergeTable<T extends SyncedRecord>(
	local: readonly T[],
	remote: readonly T[]
): TableMerge<T> {
	const localById = new Map(local.map((r) => [r.id, r]));
	const remoteById = new Map(remote.map((r) => [r.id, r]));
	const ids = new Set([...localById.keys(), ...remoteById.keys()]);

	const merged: T[] = [];
	const toLocal: T[] = [];
	let remoteChanged = false;
	for (const id of ids) {
		const mine = localById.get(id);
		const theirs = remoteById.get(id);
		const winner = mine && theirs ? newer(mine, theirs) : (mine ?? theirs)!;
		merged.push(winner);
		if (!mine || !sameRecord(winner, mine)) toLocal.push(winner);
		if (!theirs || !sameRecord(winner, theirs)) remoteChanged = true;
	}
	return { merged, toLocal, remoteChanged };
}

export type SnapshotMerge = {
	merged: Snapshot;
	toLocal: Snapshot;
	remoteChanged: boolean;
};

/**
 * Merges the local database with the sheet, table by table, then makes deletions of
 * whole lists stick: an item added offline on the phone to a list that the PC had
 * deleted in the meantime is deleted too, instead of lingering in an invisible list.
 */
export function mergeSnapshots(local: Snapshot, remote: Snapshot, now: string): SnapshotMerge {
	const lists = mergeTable(local.lists, remote.lists);
	const categories = mergeTable(local.categories, remote.categories);
	const items = mergeTable(local.items, remote.items);
	const fields = mergeTable(local.fields, remote.fields);

	const deletedLists = new Map(
		lists.merged.filter((l) => l.deletedAt).map((l) => [l.id, l.deletedAt])
	);
	const cascade = <T extends SyncedRecord & { listId: string }>(merge: TableMerge<T>) => {
		merge.merged = merge.merged.map((record) => {
			if (record.deletedAt || !deletedLists.has(record.listId)) return record;
			const tombstone = { ...record, deletedAt: deletedLists.get(record.listId)!, updatedAt: now };
			merge.toLocal = [...merge.toLocal.filter((r) => r.id !== record.id), tombstone];
			merge.remoteChanged = true;
			return tombstone;
		});
	};
	cascade(categories);
	cascade(items);
	cascade(fields);

	return {
		merged: {
			lists: lists.merged,
			categories: categories.merged,
			items: items.merged,
			fields: fields.merged
		},
		toLocal: {
			lists: lists.toLocal,
			categories: categories.toLocal,
			items: items.toLocal,
			fields: fields.toLocal
		},
		remoteChanged:
			lists.remoteChanged || categories.remoteChanged || items.remoteChanged || fields.remoteChanged
	};
}
