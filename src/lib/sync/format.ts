import { isCalendarDate } from '$lib/data/dates';
import { rowsToRecords } from '$lib/google/rows';
import { isColorName } from '$lib/data/palette';
import {
	defaultSort,
	type Category,
	type Item,
	type List,
	type SortField,
	type Timestamp
} from '$lib/data/types';

/**
 * How data is laid out in the Google Sheet. Bump FORMAT_VERSION on incompatible
 * changes: an older app then refuses to write, instead of mangling a newer sheet.
 */
export const FORMAT_VERSION = 1;

export const TABS = {
	lists: 'liste',
	categories: 'categorie',
	items: 'elementi',
	info: 'info'
} as const;

export type Snapshot = { lists: List[]; categories: Category[]; items: Item[] };

const LIST_HEADER = ['id', 'nome', 'ordina_per', 'verso', 'creata', 'modificata', 'eliminata'];
const CATEGORY_HEADER = [
	'id',
	'lista',
	'emoji',
	'nome',
	'colore',
	'posizione',
	'modificata',
	'eliminata'
];
const ITEM_HEADER = [
	'id',
	'lista',
	'nome',
	'quantita',
	'unita',
	'categorie',
	// derived, for people reading the sheet; ignored when importing
	'nomi_categorie',
	'aggiunto_il',
	'nota',
	'archiviato',
	'creato',
	'modificato',
	'eliminato'
];

const SORT_FIELDS: readonly SortField[] = ['addedOn', 'name', 'quantity', 'category'];
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const isTimestamp = (value: string): value is Timestamp => TIMESTAMP.test(value);
const optionalTimestamp = (value: string): Timestamp | null | undefined =>
	value === '' ? null : isTimestamp(value) ? value : undefined; // undefined = invalid

/** Rows for every tab, header first. */
export function toSheet(snapshot: Snapshot): Record<string, string[][]> {
	const categoryNames = new Map(snapshot.categories.map((c) => [c.id, c.name]));
	return {
		[TABS.lists]: [
			LIST_HEADER,
			...snapshot.lists.map((l) => [
				l.id,
				l.name,
				l.sort.field,
				l.sort.direction,
				l.createdAt,
				l.updatedAt,
				l.deletedAt ?? ''
			])
		],
		[TABS.categories]: [
			CATEGORY_HEADER,
			...snapshot.categories.map((c) => [
				c.id,
				c.listId,
				c.emoji,
				c.name,
				c.color,
				String(c.position),
				c.updatedAt,
				c.deletedAt ?? ''
			])
		],
		[TABS.items]: [
			ITEM_HEADER,
			...snapshot.items.map((i) => [
				i.id,
				i.listId,
				i.name,
				i.quantity === null ? '' : String(i.quantity),
				i.unit,
				i.categoryIds.join(','),
				i.categoryIds.map((id) => categoryNames.get(id) ?? '?').join(', '),
				i.addedOn,
				i.note,
				i.archivedAt ?? '',
				i.createdAt,
				i.updatedAt,
				i.deletedAt ?? ''
			])
		],
		[TABS.info]: [
			['chiave', 'valore'],
			['formato', String(FORMAT_VERSION)],
			['nota', 'Foglio gestito da Listo (listo.federicodiluca.com): modifica i dati dall’app.']
		]
	};
}

/** Records keyed by `header`; columns missing from the sheet read as empty strings. */
function read(rows: string[][] | undefined, header: string[]): Record<string, string>[] {
	return rowsToRecords(rows ?? []).map((r) =>
		Object.fromEntries(header.map((key) => [key, r[key] ?? '']))
	);
}

export type ParseResult = { snapshot: Snapshot; skipped: number; format: number };

/**
 * Reads the tabs back into records. Rows that don't make sense (e.g. edited by hand
 * in Sheets) are skipped and counted rather than imported half-broken; the app's own
 * copy then wins at the next write.
 */
export function fromSheet(tabs: Record<string, string[][]>): ParseResult {
	let skipped = 0;
	const keep = <T>(value: T | null): value is T => {
		if (value === null) skipped++;
		return value !== null;
	};

	const lists = read(tabs[TABS.lists], LIST_HEADER)
		.map((r): List | null => {
			const deletedAt = optionalTimestamp(r.eliminata);
			if (!r.id || !r.nome || !isTimestamp(r.creata) || !isTimestamp(r.modificata)) return null;
			if (deletedAt === undefined) return null;
			const field = SORT_FIELDS.find((f) => f === r.ordina_per);
			const direction = r.verso === 'desc' ? 'desc' : 'asc';
			return {
				id: r.id,
				name: r.nome,
				sort: field ? { field, direction } : defaultSort,
				createdAt: r.creata,
				updatedAt: r.modificata,
				deletedAt
			};
		})
		.filter(keep);

	const categories = read(tabs[TABS.categories], CATEGORY_HEADER)
		.map((r): Category | null => {
			const deletedAt = optionalTimestamp(r.eliminata);
			const position = Number(r.posizione);
			if (!r.id || !r.lista || !r.nome || !isTimestamp(r.modificata)) return null;
			if (deletedAt === undefined || !Number.isInteger(position)) return null;
			return {
				id: r.id,
				listId: r.lista,
				emoji: r.emoji,
				name: r.nome,
				color: isColorName(r.colore) ? r.colore : 'grigio',
				position,
				updatedAt: r.modificata,
				deletedAt
			};
		})
		.filter(keep);

	const items = read(tabs[TABS.items], ITEM_HEADER)
		.map((r): Item | null => {
			const deletedAt = optionalTimestamp(r.eliminato);
			const archivedAt = optionalTimestamp(r.archiviato);
			// the sheet is in Italian locale: a hand-typed "0,5" is fine too
			const quantity = r.quantita === '' ? null : Number(r.quantita.replace(',', '.'));
			if (!r.id || !r.lista || !r.nome || !isCalendarDate(r.aggiunto_il)) return null;
			if (!isTimestamp(r.creato) || !isTimestamp(r.modificato)) return null;
			if (deletedAt === undefined || archivedAt === undefined) return null;
			if (quantity !== null && !(quantity >= 0)) return null;
			return {
				id: r.id,
				listId: r.lista,
				name: r.nome,
				quantity,
				unit: r.unita,
				categoryIds: r.categorie ? r.categorie.split(',').filter(Boolean) : [],
				addedOn: r.aggiunto_il,
				note: r.nota,
				archivedAt,
				createdAt: r.creato,
				updatedAt: r.modificato,
				deletedAt
			};
		})
		.filter(keep);

	const info = Object.fromEntries(
		read(tabs[TABS.info], ['chiave', 'valore']).map((r) => [r.chiave, r.valore])
	);
	const format = Number(info.formato) || FORMAT_VERSION;

	return { snapshot: { lists, categories, items }, skipped, format };
}
