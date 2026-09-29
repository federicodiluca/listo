import { describe, expect, it } from 'vitest';
import {
	addDuration,
	describeExpiry,
	expiryOf,
	expiryStatus,
	formatFieldValue,
	isValidValue,
	withDefaults
} from './field-values';
import type { Field, Item } from './types';

const field = (id: string, fields: Partial<Field>): Field => ({
	id,
	listId: 'l',
	name: id,
	type: 'text',
	expiry: false,
	showInList: false,
	position: 0,
	updatedAt: '',
	deletedAt: null,
	...fields
});

const item = (fields: Partial<Item>): Item => ({
	id: 'i',
	listId: 'l',
	name: 'Minestrone',
	quantity: null,
	unit: '',
	categoryIds: [],
	addedOn: '2026-09-10',
	note: '',
	extra: {},
	archivedAt: null,
	createdAt: '',
	updatedAt: '',
	deletedAt: null,
	...fields
});

describe('addDuration', () => {
	it('adds days and calendar months', () => {
		expect(addDuration('2026-09-10', { amount: 3, unit: 'months' })).toBe('2026-12-10');
		expect(addDuration('2026-12-20', { amount: 15, unit: 'days' })).toBe('2027-01-04');
		expect(addDuration('2026-09-10', { amount: 18, unit: 'months' })).toBe('2028-03-10');
	});

	it('clamps to the end of shorter months', () => {
		expect(addDuration('2026-01-31', { amount: 1, unit: 'months' })).toBe('2026-02-28');
		expect(addDuration('2027-12-31', { amount: 2, unit: 'months' })).toBe('2028-02-29');
		expect(addDuration('2026-08-31', { amount: 1, unit: 'months' })).toBe('2026-09-30');
	});
});

describe('isValidValue', () => {
	it('checks each type', () => {
		expect(isValidValue('date', '2026-02-28')).toBe(true);
		expect(isValidValue('date', '2026-02-30')).toBe(false);
		expect(isValidValue('duration', { amount: 6, unit: 'months' })).toBe(true);
		expect(isValidValue('duration', { amount: 0, unit: 'months' })).toBe(false);
		expect(isValidValue('duration', { amount: 1.5, unit: 'days' })).toBe(false);
		expect(isValidValue('number', 0.5)).toBe(true);
		expect(isValidValue('number', '3')).toBe(false);
		expect(isValidValue('text', '  ')).toBe(false);
		expect(isValidValue('boolean', false)).toBe(true);
	});
});

describe('expiryOf', () => {
	const date = field('scadenza', { type: 'date', expiry: true, position: 0 });
	const duration = field('durata', { type: 'duration', expiry: true, position: 1 });
	const plain = field('altra', { type: 'date', expiry: false });

	it('reads a date field as the expiry itself', () => {
		expect(expiryOf(item({ extra: { scadenza: '2026-10-01' } }), [date, duration])).toBe(
			'2026-10-01'
		);
	});

	it('counts a duration from the day the item was added', () => {
		const soup = item({ extra: { durata: { amount: 3, unit: 'months' } } });
		expect(expiryOf(soup, [date, duration])).toBe('2026-12-10');
	});

	it('ignores fields not marked as expiry, and items without values', () => {
		expect(expiryOf(item({ extra: { altra: '2026-10-01' } }), [plain])).toBeNull();
		expect(expiryOf(item({}), [date, duration])).toBeNull();
	});
});

describe('expiry status and wording', () => {
	it('classifies by days left against the list threshold', () => {
		expect(expiryStatus('2026-09-27', 7, '2026-09-28')).toBe('expired');
		expect(expiryStatus('2026-10-05', 7, '2026-09-28')).toBe('soon');
		expect(expiryStatus('2026-10-06', 7, '2026-09-28')).toBe('ok');
		expect(expiryStatus('2026-09-28', 0, '2026-09-28')).toBe('soon');
	});

	it('describes the expiry in words', () => {
		const ref = '2026-09-28';
		expect(describeExpiry('2026-09-25', ref)).toBe('scaduto da 3 giorni');
		expect(describeExpiry('2026-09-27', ref)).toBe('scaduto ieri');
		expect(describeExpiry('2026-09-28', ref)).toBe('scade oggi');
		expect(describeExpiry('2026-09-29', ref)).toBe('scade domani');
		expect(describeExpiry('2026-10-08', ref)).toBe('scade tra 10 giorni');
		expect(describeExpiry('2027-03-01', ref)).toBe('scade il 1 mar 2027');
	});
});

describe('formatFieldValue', () => {
	it('formats each type for the item rows', () => {
		expect(formatFieldValue(field('Autore', { type: 'text' }), 'Calvino')).toBe('Calvino');
		expect(formatFieldValue(field('Letto', { type: 'boolean' }), true)).toBe('Letto');
		expect(formatFieldValue(field('Letto', { type: 'boolean' }), false)).toBe('');
		expect(formatFieldValue(field('Prezzo', { type: 'number' }), 2.5)).toBe('Prezzo: 2,5');
		expect(
			formatFieldValue(field('Si conserva', { type: 'duration' }), { amount: 1, unit: 'months' })
		).toBe('Si conserva: 1 mese');
		expect(formatFieldValue(field('Autore', { type: 'text' }), undefined)).toBe('');
	});
});

describe('withDefaults', () => {
	it('fills only empty fields', () => {
		expect(withDefaults({ a: 'mio' }, { a: 'predefinito', b: 3 })).toEqual({ a: 'mio', b: 3 });
		expect(withDefaults({ a: 'mio' }, { a: 'predefinito' })).toBeNull();
	});
});
