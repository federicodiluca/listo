import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ListoDatabase } from '$lib/data/db';
import { NewerFormatError, syncOnce, type SheetStore } from './engine';
import { field, item, list, T1, T2 } from './fixtures';
import { TABS } from './format';

/** The Google Sheet, simulated in memory, with a write counter. */
class MemorySheet implements SheetStore {
	tabs: Record<string, string[][]> = {};
	writes = 0;
	async read() {
		return structuredClone(this.tabs);
	}
	async write(tabs: Record<string, string[][]>) {
		this.tabs = structuredClone(tabs);
		this.writes++;
	}
}

let pc: ListoDatabase;
let phone: ListoDatabase;
let sheet: MemorySheet;

beforeEach(() => {
	pc = new ListoDatabase(`pc-${crypto.randomUUID()}`);
	phone = new ListoDatabase(`phone-${crypto.randomUUID()}`);
	sheet = new MemorySheet();
});

afterEach(async () => {
	await pc.delete();
	await phone.delete();
});

describe('syncOnce between two devices', () => {
	it('brings data created on the PC to the phone', async () => {
		await pc.lists.add(list('freezer', { name: 'Congelatore' }));
		await pc.items.add(item('soup', 'freezer', { name: 'Minestrone' }));

		expect(await syncOnce(pc, sheet)).toMatchObject({ received: 0, sent: true });
		expect(await syncOnce(phone, sheet)).toMatchObject({ received: 2, sent: false });

		expect((await phone.lists.get('freezer'))?.name).toBe('Congelatore');
		expect((await phone.items.get('soup'))?.name).toBe('Minestrone');
	});

	it('brings custom fields and their values to the other device', async () => {
		await pc.lists.add(list('l'));
		await pc.fields.add(field('keeps', 'l'));
		await pc.items.add(item('soup', 'l', { extra: { keeps: { amount: 3, unit: 'months' } } }));
		await syncOnce(pc, sheet);
		await syncOnce(phone, sheet);
		expect((await phone.fields.get('keeps'))?.type).toBe('duration');
		expect((await phone.items.get('soup'))?.extra).toEqual({
			keeps: { amount: 3, unit: 'months' }
		});
	});

	it('merges offline edits from both sides, newest edit per item wins', async () => {
		await pc.lists.add(list('l'));
		await pc.items.bulkAdd([item('a', 'l'), item('b', 'l')]);
		await syncOnce(pc, sheet);
		await syncOnce(phone, sheet);

		// both offline: PC edits A, phone edits B and (later) A as well
		await pc.items.update('a', { quantity: 1, updatedAt: T1 });
		await phone.items.update('b', { quantity: 2, updatedAt: T1 });
		await phone.items.update('a', { quantity: 9, updatedAt: T2 });

		await syncOnce(pc, sheet);
		await syncOnce(phone, sheet);
		await syncOnce(pc, sheet);

		for (const device of [pc, phone]) {
			expect((await device.items.get('a'))?.quantity).toBe(9);
			expect((await device.items.get('b'))?.quantity).toBe(2);
		}
	});

	it('propagates deletions instead of resurrecting them', async () => {
		await pc.lists.add(list('l'));
		await pc.items.add(item('gone', 'l'));
		await syncOnce(pc, sheet);
		await syncOnce(phone, sheet);

		await phone.items.update('gone', { deletedAt: T2, updatedAt: T2 });
		await syncOnce(phone, sheet);
		await syncOnce(pc, sheet);

		expect((await pc.items.get('gone'))?.deletedAt).toBe(T2);
	});

	it('does not rewrite the sheet when nothing changed', async () => {
		await pc.lists.add(list('l'));
		await syncOnce(pc, sheet);
		const writes = sheet.writes;
		await syncOnce(pc, sheet);
		await syncOnce(pc, sheet);
		expect(sheet.writes).toBe(writes);
	});

	it('keeps a local edit made while the sync was reading the sheet', async () => {
		await pc.lists.add(list('l', { name: 'Vecchio', updatedAt: T1 }));
		await syncOnce(pc, sheet);
		await phone.lists.add(list('l', { name: 'Dal telefono', updatedAt: T1 })); // same age

		// the phone edits the list while its sync is waiting for the network
		const slowSheet: SheetStore = {
			read: async () => {
				const tabs = await sheet.read();
				await phone.lists.update('l', { name: 'Modificato ora', updatedAt: T2 });
				return tabs;
			},
			write: (tabs) => sheet.write(tabs)
		};
		await syncOnce(phone, slowSheet);
		expect((await phone.lists.get('l'))?.name).toBe('Modificato ora');
	});

	it('reports how far the sync got, so later local edits count as pending', async () => {
		await pc.lists.add(list('l', { updatedAt: T1 }));
		await pc.items.add(item('i', 'l', { updatedAt: T2 }));
		expect((await syncOnce(pc, sheet)).syncedUpTo).toBe(T2);
	});

	it('refuses to touch a sheet written by a newer app version', async () => {
		await pc.lists.add(list('l'));
		await syncOnce(pc, sheet);
		sheet.tabs[TABS.info][1][1] = '99';
		const before = structuredClone(sheet.tabs);

		await expect(syncOnce(phone, sheet)).rejects.toBeInstanceOf(NewerFormatError);
		expect(sheet.tabs).toEqual(before);
	});
});
