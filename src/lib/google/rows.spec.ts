import { describe, expect, it } from 'vitest';
import { rowsToRecords } from './rows';

describe('rowsToRecords', () => {
	it('maps each row to the header keys', () => {
		const rows = [
			['id', 'nome', 'quantita'],
			['a1', 'Minestrone', '3']
		];
		expect(rowsToRecords(rows)).toEqual([{ id: 'a1', nome: 'Minestrone', quantita: '3' }]);
	});

	it('fills cells trimmed by the Sheets API with empty strings', () => {
		const rows = [
			['id', 'nome', 'nota'],
			['a1', 'Piselli']
		];
		expect(rowsToRecords(rows)).toEqual([{ id: 'a1', nome: 'Piselli', nota: '' }]);
	});

	it('skips empty rows', () => {
		const rows = [['id', 'nome'], [], ['', ''], ['a1', 'Pesto']];
		expect(rowsToRecords(rows)).toEqual([{ id: 'a1', nome: 'Pesto' }]);
	});

	it('returns nothing for an empty sheet', () => {
		expect(rowsToRecords([])).toEqual([]);
		expect(rowsToRecords([['id', 'nome']])).toEqual([]);
	});
});
