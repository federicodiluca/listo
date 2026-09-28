import { describe, expect, it } from 'vitest';
import { category, item, list, T1 } from './fixtures';
import { FORMAT_VERSION, fromSheet, TABS, toSheet, type Snapshot } from './format';

const snapshot: Snapshot = {
	lists: [
		list('l1', { sort: { field: 'category', direction: 'desc' } }),
		list('l2', { deletedAt: T1 })
	],
	categories: [
		category('c1', 'l1', { emoji: '👨‍👩‍👧', position: 0 }),
		category('c2', 'l1', { emoji: '', color: 'rosso', position: 1 })
	],
	items: [
		item('i1', 'l1', {
			name: 'Minestrone, con farro',
			quantity: 0.5,
			unit: 'kg',
			categoryIds: ['c1', 'c2'],
			note: 'riga 1\nriga 2',
			archivedAt: T1
		}),
		item('i2', 'l1')
	]
};

describe('sheet format', () => {
	it('survives a round trip unchanged', () => {
		const { snapshot: back, skipped, format } = fromSheet(toSheet(snapshot));
		expect(back).toEqual(snapshot);
		expect(skipped).toBe(0);
		expect(format).toBe(FORMAT_VERSION);
	});

	it('adds readable category names to items, ignored when importing', () => {
		const rows = toSheet(snapshot)[TABS.items];
		const column = rows[0].indexOf('nomi_categorie');
		expect(rows[1][column]).toBe('Categoria c1, Categoria c2');
	});

	it('copes with the API dropping trailing empty cells', () => {
		const tabs = toSheet({ lists: [list('l1')], categories: [], items: [] });
		tabs[TABS.lists][1] = tabs[TABS.lists][1].slice(0, -1); // no "eliminata" cell
		expect(fromSheet(tabs).snapshot.lists[0].deletedAt).toBeNull();
	});

	it('accepts a hand-typed decimal comma', () => {
		const tabs = toSheet({ lists: [], categories: [], items: [item('i1', 'l1', { quantity: 1 })] });
		tabs[TABS.items][1][3] = '0,5';
		expect(fromSheet(tabs).snapshot.items[0].quantity).toBe(0.5);
	});

	it('skips rows that were broken by hand, and counts them', () => {
		const tabs = toSheet(snapshot);
		tabs[TABS.items][1][7] = '10/09/2026'; // aggiunto_il reformatted by Sheets
		tabs[TABS.categories][2][5] = 'secondo'; // position not a number
		const { snapshot: back, skipped } = fromSheet(tabs);
		expect(back.items.map((i) => i.id)).toEqual(['i2']);
		expect(back.categories.map((c) => c.id)).toEqual(['c1']);
		expect(skipped).toBe(2);
	});

	it('falls back to safe values for unknown colors and sort fields', () => {
		const tabs = toSheet(snapshot);
		tabs[TABS.categories][1][4] = 'fucsia';
		tabs[TABS.lists][1][2] = 'peso';
		const { snapshot: back } = fromSheet(tabs);
		expect(back.categories[0].color).toBe('grigio');
		expect(back.lists[0].sort).toEqual({ field: 'addedOn', direction: 'asc' });
	});

	it('reads an empty or brand new sheet as no data', () => {
		expect(fromSheet({}).snapshot).toEqual({ lists: [], categories: [], items: [] });
	});

	it('reports the format version written in the info tab', () => {
		const tabs = toSheet(snapshot);
		tabs[TABS.info][1][1] = '7';
		expect(fromSheet(tabs).format).toBe(7);
	});
});
