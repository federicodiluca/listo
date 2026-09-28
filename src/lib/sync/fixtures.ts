import type { Category, Item, List } from '$lib/data/types';

// Small factories for sync tests: valid records with overridable fields.

export const T0 = '2026-09-01T10:00:00.000Z';
export const T1 = '2026-09-02T10:00:00.000Z';
export const T2 = '2026-09-03T10:00:00.000Z';

export const list = (id: string, fields: Partial<List> = {}): List => ({
	id,
	name: `Lista ${id}`,
	sort: { field: 'addedOn', direction: 'asc' },
	createdAt: T0,
	updatedAt: T0,
	deletedAt: null,
	...fields
});

export const category = (id: string, listId: string, fields: Partial<Category> = {}): Category => ({
	id,
	listId,
	emoji: '🥦',
	name: `Categoria ${id}`,
	color: 'verde',
	position: 0,
	updatedAt: T0,
	deletedAt: null,
	...fields
});

export const item = (id: string, listId: string, fields: Partial<Item> = {}): Item => ({
	id,
	listId,
	name: `Elemento ${id}`,
	quantity: null,
	unit: '',
	categoryIds: [],
	addedOn: '2026-09-01',
	note: '',
	archivedAt: null,
	createdAt: T0,
	updatedAt: T0,
	deletedAt: null,
	...fields
});
