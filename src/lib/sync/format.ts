import { isCalendarDate } from '$lib/data/dates';
import { rowsToRecords } from '$lib/google/rows';
import { isColorName } from '$lib/data/palette';
import {
	defaultSort,
	type Category,
	type Field,
	type FieldType,
	type FieldValues,
	type Item,
	type List,
	type SortField,
	type Timestamp
} from '$lib/data/types';

/**
 * How data is laid out in the Google Sheet. Bump FORMAT_VERSION on incompatible
 * changes: an older app then refuses to write, instead of mangling a newer sheet.
 * v2: custom fields (new "campi" tab and columns); v1 sheets are still read fine.
 * v3: grouping by category is its own list setting ("raggruppa"), no longer a sort.
 */
export const FORMAT_VERSION = 3;

export const TABS = {
	lists: 'liste',
	categories: 'categorie',
	items: 'elementi',
	fields: 'campi',
	info: 'info'
} as const;

export type Snapshot = { lists: List[]; categories: Category[]; items: Item[]; fields: Field[] };

const LIST_HEADER = [
	'id',
	'nome',
	'ordina_per',
	'verso',
	'raggruppa',
	'avviso_scadenza',
	'creata',
	'modificata',
	'eliminata'
];
const CATEGORY_HEADER = [
	'id',
	'lista',
	'emoji',
	'nome',
	'colore',
	'posizione',
	// custom field values given to items that get this category, as JSON
	'predefiniti',
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
	// custom field values, as JSON keyed by field id (see the "campi" tab)
	'campi',
	'archiviato',
	'creato',
	'modificato',
	'eliminato'
];

const FIELD_HEADER = [
	'id',
	'lista',
	'nome',
	'tipo',
	'scadenza',
	'in_lista',
	'posizione',
	'modificato',
	'eliminato'
];

const SORT_FIELDS: readonly SortField[] = ['addedOn', 'name', 'quantity', 'expiry'];
const FIELD_TYPES: readonly FieldType[] = ['date', 'duration', 'number', 'text', 'boolean'];
const flag = (value: boolean) => (value ? 'sì' : '');
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const isTimestamp = (value: string): value is Timestamp => TIMESTAMP.test(value);
const optionalTimestamp = (value: string): Timestamp | null | undefined =>
	value === '' ? null : isTimestamp(value) ? value : undefined; // undefined = invalid

/**
 * JSON object of field values. Only the shape is checked here (which field has which
 * type is known later): each value must be a string, number, boolean or a duration.
 * Returns null when the cell is not valid JSON of that shape.
 */
function parseValues(text: string): FieldValues | null {
	if (text === '') return {};
	try {
		const value: unknown = JSON.parse(text);
		if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
		const ok = Object.values(value).every(
			(v) =>
				['string', 'number', 'boolean'].includes(typeof v) ||
				(typeof v === 'object' &&
					v !== null &&
					Number.isInteger(v.amount) &&
					['days', 'months'].includes(v.unit))
		);
		return ok ? (value as FieldValues) : null;
	} catch {
		return null;
	}
}

const json = (values: FieldValues) => (Object.keys(values).length ? JSON.stringify(values) : '');

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
				flag(l.groupByCategory),
				String(l.expiryWarningDays),
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
				json(c.defaults),
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
				json(i.extra),
				i.archivedAt ?? '',
				i.createdAt,
				i.updatedAt,
				i.deletedAt ?? ''
			])
		],
		[TABS.fields]: [
			FIELD_HEADER,
			...snapshot.fields.map((f) => [
				f.id,
				f.listId,
				f.name,
				f.type,
				flag(f.expiry),
				flag(f.showInList),
				String(f.position),
				f.updatedAt,
				f.deletedAt ?? ''
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

	const present = Object.fromEntries((tabs[TABS.lists]?.[0] ?? []).map((column) => [column, true]));
	const lists = read(tabs[TABS.lists], LIST_HEADER)
		.map((r): List | null => {
			const deletedAt = optionalTimestamp(r.eliminata);
			if (!r.id || !r.nome || !isTimestamp(r.creata) || !isTimestamp(r.modificata)) return null;
			if (deletedAt === undefined) return null;
			// sheets before v3 had "by category" as a sort: now it's grouping + by name
			const legacyCategory = r.ordina_per === 'category';
			const field = legacyCategory ? 'name' : SORT_FIELDS.find((f) => f === r.ordina_per);
			const direction = r.verso === 'desc' && !legacyCategory ? 'desc' : 'asc';
			const warning = Number(r.avviso_scadenza);
			return {
				id: r.id,
				name: r.nome,
				sort: field ? { field, direction } : defaultSort,
				// missing before v3: grouped, the default
				groupByCategory: r.raggruppa !== '' || legacyCategory || !('raggruppa' in present),
				// missing in v1 sheets: the default
				expiryWarningDays: r.avviso_scadenza !== '' && Number.isInteger(warning) ? warning : 7,
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
			const defaults = parseValues(r.predefiniti);
			if (!r.id || !r.lista || !r.nome || !isTimestamp(r.modificata)) return null;
			if (deletedAt === undefined || !Number.isInteger(position) || !defaults) return null;
			return {
				id: r.id,
				listId: r.lista,
				emoji: r.emoji,
				name: r.nome,
				color: isColorName(r.colore) ? r.colore : 'grigio',
				position,
				defaults,
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
			const extra = parseValues(r.campi);
			if (!r.id || !r.lista || !r.nome || !isCalendarDate(r.aggiunto_il)) return null;
			if (!isTimestamp(r.creato) || !isTimestamp(r.modificato)) return null;
			if (deletedAt === undefined || archivedAt === undefined) return null;
			if (quantity !== null && !(quantity >= 0)) return null;
			if (!extra) return null;
			return {
				id: r.id,
				listId: r.lista,
				name: r.nome,
				quantity,
				unit: r.unita,
				categoryIds: r.categorie ? r.categorie.split(',').filter(Boolean) : [],
				addedOn: r.aggiunto_il,
				note: r.nota,
				extra,
				archivedAt,
				createdAt: r.creato,
				updatedAt: r.modificato,
				deletedAt
			};
		})
		.filter(keep);

	const fields = read(tabs[TABS.fields], FIELD_HEADER)
		.map((r): Field | null => {
			const deletedAt = optionalTimestamp(r.eliminato);
			const type = FIELD_TYPES.find((t) => t === r.tipo);
			const position = Number(r.posizione);
			if (!r.id || !r.lista || !r.nome || !type || !isTimestamp(r.modificato)) return null;
			if (deletedAt === undefined || !Number.isInteger(position)) return null;
			return {
				id: r.id,
				listId: r.lista,
				name: r.nome,
				type,
				expiry: r.scadenza !== '' && (type === 'date' || type === 'duration'),
				showInList: r.in_lista !== '',
				position,
				updatedAt: r.modificato,
				deletedAt
			};
		})
		.filter(keep);

	const info = Object.fromEntries(
		read(tabs[TABS.info], ['chiave', 'valore']).map((r) => [r.chiave, r.valore])
	);
	const format = Number(info.formato) || FORMAT_VERSION;

	return { snapshot: { lists, categories, items, fields }, skipped, format };
}
