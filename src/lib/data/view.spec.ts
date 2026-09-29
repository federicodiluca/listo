import { describe, expect, it } from 'vitest';
import type { Category, Item } from './types';
import { filterItems, groupByCategory, sortItems } from './view';

const category = (id: string, position: number): Category => ({
	id,
	listId: 'l',
	emoji: '',
	name: id,
	color: 'grigio',
	position,
	defaults: {},
	updatedAt: '',
	deletedAt: null
});

const item = (name: string, fields: Partial<Item> = {}): Item => ({
	id: name,
	listId: 'l',
	name,
	quantity: null,
	unit: '',
	categoryIds: [],
	addedOn: '2026-09-01',
	note: '',
	extra: {},
	archivedAt: null,
	createdAt: '',
	updatedAt: '',
	deletedAt: null,
	...fields
});

const names = (items: Item[]) => items.map((i) => i.name);

describe('filterItems', () => {
	const items = [
		item('Minestrone', { categoryIds: ['veg', 'ready'] }),
		item('Piselli', { categoryIds: ['veg'] }),
		item('Lasagne', { categoryIds: ['ready'], note: 'della nonna' }),
		item('Pollo', { categoryIds: ['meat'] }),
		item('Gelato', { archivedAt: '2026-09-10T00:00:00.000Z' })
	];
	const none = { archived: false, categoryIds: new Set<string>(), query: '' };

	it('shows active items by default, archived ones on request', () => {
		expect(names(filterItems(items, none))).toEqual(['Minestrone', 'Piselli', 'Lasagne', 'Pollo']);
		expect(names(filterItems(items, { ...none, archived: true }))).toEqual(['Gelato']);
	});

	it('matches items having at least one selected category', () => {
		const filter = { ...none, categoryIds: new Set(['veg', 'meat']) };
		expect(names(filterItems(items, filter))).toEqual(['Minestrone', 'Piselli', 'Pollo']);
	});

	it('searches name and note, ignoring case and accents', () => {
		expect(names(filterItems(items, { ...none, query: 'NONNA' }))).toEqual(['Lasagne']);
		expect(names(filterItems([item('Caffè')], { ...none, query: 'caffe' }))).toEqual(['Caffè']);
	});
});

describe('sortItems', () => {
	const items = [
		item('Pollo', { addedOn: '2026-09-10', quantity: 2 }),
		item('ali di pollo', { addedOn: '2026-08-01', quantity: null }),
		item('Minestrone', { addedOn: '2026-09-10', quantity: 0.5 }),
		item('Zucchine', { addedOn: '2026-07-15', quantity: 4 })
	];

	it('by date, ties broken by name', () => {
		expect(names(sortItems(items, { field: 'addedOn', direction: 'asc' }))).toEqual([
			'Zucchine',
			'ali di pollo',
			'Minestrone',
			'Pollo'
		]);
		expect(names(sortItems(items, { field: 'addedOn', direction: 'desc' }))[0]).toBe('Minestrone');
	});

	it('by name, ignoring case', () => {
		expect(names(sortItems(items, { field: 'name', direction: 'asc' }))).toEqual([
			'ali di pollo',
			'Minestrone',
			'Pollo',
			'Zucchine'
		]);
	});

	it('by quantity, items without quantity always last', () => {
		expect(names(sortItems(items, { field: 'quantity', direction: 'asc' }))).toEqual([
			'Minestrone',
			'Pollo',
			'Zucchine',
			'ali di pollo'
		]);
		expect(names(sortItems(items, { field: 'quantity', direction: 'desc' }))).toEqual([
			'Zucchine',
			'Pollo',
			'Minestrone',
			'ali di pollo'
		]);
	});
});

describe('sortItems by expiry', () => {
	const expiries: Record<string, string | null> = {
		Pesce: '2026-10-01',
		Pane: null,
		Carne: '2026-09-30'
	};
	const items = [item('Pesce'), item('Pane'), item('Carne')];
	const expiry = (i: Item) => expiries[i.name];

	it('puts what expires first on top, items without expiry at the bottom', () => {
		expect(names(sortItems(items, { field: 'expiry', direction: 'asc' }, expiry))).toEqual([
			'Carne',
			'Pesce',
			'Pane'
		]);
		expect(names(sortItems(items, { field: 'expiry', direction: 'desc' }, expiry))).toEqual([
			'Pesce',
			'Carne',
			'Pane'
		]);
	});

	it('filters with a custom test', () => {
		const filter = {
			archived: false,
			categoryIds: new Set<string>(),
			query: '',
			only: (i: Item) => expiry(i) !== null
		};
		expect(names(filterItems(items, filter))).toEqual(['Pesce', 'Carne']);
	});
});

describe('groupByCategory', () => {
	const categories = [category('ready', 1), category('veg', 0), category('meat', 2)];
	const items = [
		item('Piselli', { categoryIds: ['veg'] }),
		item('Minestrone', { categoryIds: ['ready', 'veg'] }),
		item('Lasagne', { categoryIds: ['ready'] }),
		item('Ghiaccio'),
		item('Orfano', { categoryIds: ['deleted-category'] })
	];
	const ids = (groups: ReturnType<typeof groupByCategory>) =>
		groups.map((g) => [g.category?.id ?? null, names(g.items)]);

	it('puts each item once, under its first category in the user order', () => {
		expect(ids(groupByCategory(items, categories))).toEqual([
			['veg', ['Piselli', 'Minestrone']],
			['ready', ['Lasagne']],
			[null, ['Ghiaccio', 'Orfano']]
		]);
	});

	it('with a filter, uses the first selected category the item has', () => {
		const filtered = items.filter((i) => i.categoryIds.includes('ready'));
		expect(ids(groupByCategory(filtered, categories, new Set(['ready'])))).toEqual([
			['ready', ['Minestrone', 'Lasagne']]
		]);
	});

	it('keeps the incoming order inside each group', () => {
		const reversed = [...items].reverse();
		expect(ids(groupByCategory(reversed, categories))[0]).toEqual([
			'veg',
			['Minestrone', 'Piselli']
		]);
	});
});
