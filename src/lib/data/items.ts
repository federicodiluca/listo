import { isCalendarDate, today } from './dates';
import { db } from './db';
import { cleanName } from './text';
import type { Item, ItemDraft } from './types';

const now = () => new Date().toISOString();

/** Lower-cased, accent-free form used to compare names: "Caffè " → "caffe". */
export function normalize(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

/**
 * Parses what the user typed as quantity: accepts the Italian decimal comma ("0,5"),
 * returns null for an empty field. Negative or non-numeric input is rejected.
 */
export function parseQuantity(input: string): number | null {
	const text = input.trim().replace(',', '.');
	if (!text) return null;
	const value = Number(text);
	if (!Number.isFinite(value) || value < 0) throw new Error('Quantità non valida.');
	return value;
}

/** Adds an item with just a name: today's date, no quantity, no categories. */
export async function addItem(listId: string, name: string): Promise<string> {
	const timestamp = now();
	const item: Item = {
		id: crypto.randomUUID(),
		listId,
		name: cleanName(name),
		quantity: null,
		unit: '',
		categoryIds: [],
		addedOn: today(),
		note: '',
		archivedAt: null,
		createdAt: timestamp,
		updatedAt: timestamp
	};
	await db.items.add(item);
	return item.id;
}

export async function getItems(listId: string): Promise<Item[]> {
	return db.items.where('listId').equals(listId).toArray();
}

export async function getItem(id: string): Promise<Item | null> {
	return (await db.items.get(id)) ?? null;
}

export async function updateItem(id: string, changes: Partial<ItemDraft>): Promise<void> {
	const update: Partial<Item> = { updatedAt: now() };
	if (changes.name !== undefined) update.name = cleanName(changes.name);
	if (changes.quantity !== undefined) {
		if (changes.quantity !== null && !(changes.quantity >= 0)) {
			throw new Error('Quantità non valida.');
		}
		update.quantity = changes.quantity;
	}
	if (changes.unit !== undefined) update.unit = changes.unit.trim();
	if (changes.note !== undefined) update.note = changes.note.trim();
	if (changes.addedOn !== undefined) {
		if (!isCalendarDate(changes.addedOn)) throw new Error('Data non valida.');
		update.addedOn = changes.addedOn;
	}
	if (changes.categoryIds !== undefined) update.categoryIds = [...new Set(changes.categoryIds)];
	await db.items.update(id, update);
}

/** Adds the category if missing, removes it if present. */
export async function toggleItemCategory(id: string, categoryId: string): Promise<void> {
	await db.transaction('rw', db.items, async () => {
		const item = await db.items.get(id);
		if (!item) return;
		const categoryIds = item.categoryIds.includes(categoryId)
			? item.categoryIds.filter((c) => c !== categoryId)
			: [...item.categoryIds, categoryId];
		await db.items.update(id, { categoryIds, updatedAt: now() });
	});
}

export async function archiveItem(id: string): Promise<void> {
	await db.items.update(id, { archivedAt: now(), updatedAt: now() });
}

/**
 * Brings an archived item back ("ripesca"): same name, unit and categories, dated
 * today, quantity to be confirmed by the user.
 */
export async function restoreItem(id: string): Promise<void> {
	await db.items.update(id, {
		archivedAt: null,
		addedOn: today(),
		quantity: null,
		updatedAt: now()
	});
}

export async function deleteItem(id: string): Promise<void> {
	await db.items.delete(id);
}

export type NameMatch = { item: Item; archived: boolean };

/**
 * Items of the list whose name contains what the user is typing, for the quick-add
 * suggestions: archived ones can be brought back, active ones warn "already there".
 * Names starting with the text come first.
 */
export function matchByName(items: readonly Item[], text: string, limit = 5): NameMatch[] {
	const query = normalize(text);
	if (!query) return [];
	return items
		.filter((item) => normalize(item.name).includes(query))
		.sort((a, b) => {
			const aStarts = normalize(a.name).startsWith(query);
			const bStarts = normalize(b.name).startsWith(query);
			if (aStarts !== bStarts) return aStarts ? -1 : 1;
			return a.name.localeCompare(b.name, 'it');
		})
		.slice(0, limit)
		.map((item) => ({ item, archived: item.archivedAt !== null }));
}

/** "3 porzioni", "0,5 kg", "2"; empty when no quantity is set. */
export function formatQuantity(quantity: number | null, unit: string): string {
	if (quantity === null) return '';
	const number = quantity.toLocaleString('it-IT', { maximumFractionDigits: 2 });
	return unit ? `${number} ${unit}` : number;
}
