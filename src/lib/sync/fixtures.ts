import type { Category, Field, Item, List } from '$lib/data/types';

// Small factories for sync tests: valid records with overridable fields.

export const T0 = '2026-09-01T10:00:00.000Z';
export const T1 = '2026-09-02T10:00:00.000Z';
export const T2 = '2026-09-03T10:00:00.000Z';

export const list = (id: string, fields: Partial<List> = {}): List => ({
	id,
	name: `Lista ${id}`,
	sort: { field: 'addedOn', direction: 'asc' },
	expiryWarningDays: 7,
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
	defaults: {},
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
	extra: {},
	archivedAt: null,
	createdAt: T0,
	updatedAt: T0,
	deletedAt: null,
	...fields
});

export const field = (id: string, listId: string, fields: Partial<Field> = {}): Field => ({
	id,
	listId,
	name: `Campo ${id}`,
	type: 'duration',
	expiry: true,
	showInList: false,
	position: 0,
	updatedAt: T0,
	deletedAt: null,
	...fields
});
