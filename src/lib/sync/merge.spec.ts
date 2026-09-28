import { describe, expect, it } from 'vitest';
import { category, item, list, T0, T1, T2 } from './fixtures';
import type { Snapshot } from './format';
import { mergeSnapshots, mergeTable, newer } from './merge';

const empty: Snapshot = { lists: [], categories: [], items: [] };
const NOW = '2026-09-28T12:00:00.000Z';

describe('newer', () => {
	it('picks the most recent update', () => {
		const old = item('i', 'l', { name: 'vecchio', updatedAt: T1 });
		const recent = item('i', 'l', { name: 'nuovo', updatedAt: T2 });
		expect(newer(old, recent)).toBe(recent);
		expect(newer(recent, old)).toBe(recent);
	});

	it('breaks exact ties the same way whatever the argument order', () => {
		const a = item('i', 'l', { name: 'A', updatedAt: T1 });
		const b = item('i', 'l', { name: 'B', updatedAt: T1 });
		expect(newer(a, b)).toEqual(newer(b, a));
	});
});

describe('mergeTable', () => {
	it('unions records that exist on one side only', () => {
		const result = mergeTable([item('mine', 'l')], [item('theirs', 'l')]);
		expect(result.merged.map((r) => r.id).sort()).toEqual(['mine', 'theirs']);
		expect(result.toLocal.map((r) => r.id)).toEqual(['theirs']);
		expect(result.remoteChanged).toBe(true);
	});

	it('keeps the newer side and reports who needs updating', () => {
		const localNewer = mergeTable(
			[item('i', 'l', { quantity: 2, updatedAt: T2 })],
			[item('i', 'l', { quantity: 3, updatedAt: T1 })]
		);
		expect(localNewer.merged[0].quantity).toBe(2);
		expect(localNewer.toLocal).toEqual([]);
		expect(localNewer.remoteChanged).toBe(true);

		const remoteNewer = mergeTable(
			[item('i', 'l', { quantity: 2, updatedAt: T1 })],
			[item('i', 'l', { quantity: 3, updatedAt: T2 })]
		);
		expect(remoteNewer.merged[0].quantity).toBe(3);
		expect(remoteNewer.toLocal.map((r) => r.quantity)).toEqual([3]);
		expect(remoteNewer.remoteChanged).toBe(false);
	});

	it('does nothing when both sides already agree', () => {
		const same = [item('i', 'l', { categoryIds: ['a', 'b'] })];
		const result = mergeTable(same, structuredClone(same));
		expect(result.toLocal).toEqual([]);
		expect(result.remoteChanged).toBe(false);
	});

	it('lets a newer deletion win over an older edit, and vice versa', () => {
		const deletedLater = mergeTable(
			[item('i', 'l', { note: 'modificato', updatedAt: T1 })],
			[item('i', 'l', { deletedAt: T2, updatedAt: T2 })]
		);
		expect(deletedLater.merged[0].deletedAt).toBe(T2);

		const editedLater = mergeTable(
			[item('i', 'l', { note: 'modificato', updatedAt: T2 })],
			[item('i', 'l', { deletedAt: T1, updatedAt: T1 })]
		);
		expect(editedLater.merged[0].deletedAt).toBeNull();
	});
});

describe('mergeSnapshots', () => {
	it('first connection of a device: local and remote lists end up together', () => {
		const phone: Snapshot = { ...empty, lists: [list('freezer')] };
		const sheet: Snapshot = { ...empty, lists: [list('pantry')] };
		const { merged, toLocal, remoteChanged } = mergeSnapshots(phone, sheet, NOW);
		expect(merged.lists.map((l) => l.id).sort()).toEqual(['freezer', 'pantry']);
		expect(toLocal.lists.map((l) => l.id)).toEqual(['pantry']);
		expect(remoteChanged).toBe(true);
	});

	it('deletes items added offline to a list deleted elsewhere', () => {
		// PC deleted the list at T1; the phone, offline, added an item at T2
		const phone: Snapshot = {
			lists: [list('l')],
			categories: [category('c', 'l')],
			items: [item('late', 'l', { createdAt: T2, updatedAt: T2 })]
		};
		const sheet: Snapshot = {
			lists: [list('l', { deletedAt: T1, updatedAt: T1 })],
			categories: [category('c', 'l', { deletedAt: T1, updatedAt: T1 })],
			items: []
		};
		const { merged, toLocal, remoteChanged } = mergeSnapshots(phone, sheet, NOW);
		expect(merged.lists[0].deletedAt).toBe(T1);
		expect(merged.items[0]).toMatchObject({ id: 'late', deletedAt: T1, updatedAt: NOW });
		expect(toLocal.items.map((i) => i.id)).toEqual(['late']);
		expect(remoteChanged).toBe(true);
	});

	it('is stable: merging the result again changes nothing', () => {
		const phone: Snapshot = {
			lists: [list('l', { name: 'Congelatore', updatedAt: T2 })],
			categories: [category('c', 'l')],
			items: [item('i', 'l', { quantity: 1, updatedAt: T1 })]
		};
		const sheet: Snapshot = {
			lists: [list('l', { name: 'Freezer', updatedAt: T1 })],
			categories: [],
			items: [item('i', 'l', { quantity: 4, updatedAt: T2 }), item('j', 'l', { updatedAt: T0 })]
		};
		const first = mergeSnapshots(phone, sheet, NOW).merged;
		const again = mergeSnapshots(first, first, NOW);
		expect(again.remoteChanged).toBe(false);
		expect(again.toLocal).toEqual(empty);
		expect(first.lists[0].name).toBe('Congelatore');
		expect(first.items.find((i) => i.id === 'i')?.quantity).toBe(4);
	});
});
