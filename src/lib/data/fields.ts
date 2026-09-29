import { db } from './db';
import { canBeExpiry, isValidValue } from './field-values';
import { cleanName } from './text';
import type { Field, FieldDraft, FieldValue } from './types';

const now = () => new Date().toISOString();

export function toField(listId: string, draft: FieldDraft, position: number): Field {
	return {
		id: crypto.randomUUID(),
		listId,
		name: cleanName(draft.name),
		type: draft.type,
		expiry: draft.expiry && canBeExpiry(draft.type),
		showInList: draft.showInList,
		position,
		updatedAt: now(),
		deletedAt: null
	};
}

/** Custom fields of a list, in the user's order. */
export async function getFields(listId: string): Promise<Field[]> {
	return db.fields
		.where('listId')
		.equals(listId)
		.filter((f) => !f.deletedAt)
		.sortBy('position');
}

export async function addField(listId: string, draft: FieldDraft): Promise<string> {
	return db.transaction('rw', db.fields, async () => {
		const field = toField(listId, draft, (await getFields(listId)).length);
		await db.fields.add(field);
		return field.id;
	});
}

/** Name and display options; the type never changes (existing values would break). */
export async function updateField(
	id: string,
	changes: Partial<Pick<Field, 'name' | 'expiry' | 'showInList'>>
): Promise<void> {
	const field = await db.fields.get(id);
	if (!field) return;
	const update: Partial<Field> = { updatedAt: now() };
	if (changes.name !== undefined) update.name = cleanName(changes.name);
	if (changes.expiry !== undefined) update.expiry = changes.expiry && canBeExpiry(field.type);
	if (changes.showInList !== undefined) update.showInList = changes.showInList;
	await db.fields.update(id, update);
}

export async function moveField(id: string, direction: -1 | 1): Promise<void> {
	await db.transaction('rw', db.fields, async () => {
		const field = await db.fields.get(id);
		if (!field) return;
		const siblings = await getFields(field.listId);
		const index = siblings.findIndex((f) => f.id === id);
		const neighbour = siblings[index + direction];
		if (!neighbour) return;
		const timestamp = now();
		await db.fields.update(field.id, { position: neighbour.position, updatedAt: timestamp });
		await db.fields.update(neighbour.id, { position: field.position, updatedAt: timestamp });
	});
}

/**
 * Deletes a field (as a tombstone, for sync). Values already stored in items stay in
 * their `extra` but are no longer shown: cheap, and nothing to clean up in every item.
 */
export async function deleteField(id: string): Promise<void> {
	await db.transaction('rw', db.fields, async () => {
		const field = await db.fields.get(id);
		if (!field) return;
		const timestamp = now();
		await db.fields.update(id, { deletedAt: timestamp, updatedAt: timestamp });
		const rest = await getFields(field.listId);
		await Promise.all(
			rest.map((f, i) =>
				f.position === i ? undefined : db.fields.update(f.id, { position: i, updatedAt: timestamp })
			)
		);
	});
}

/** Sets (or clears, with null) the value a category gives to a field. */
export async function setCategoryDefault(
	categoryId: string,
	field: Field,
	value: FieldValue | null
): Promise<void> {
	await db.transaction('rw', db.categories, async () => {
		const category = await db.categories.get(categoryId);
		if (!category) return;
		const defaults = { ...category.defaults };
		if (value === null || !isValidValue(field.type, value)) delete defaults[field.id];
		else defaults[field.id] = value;
		await db.categories.update(categoryId, { defaults, updatedAt: now() });
	});
}

/** Sets (or clears, with null) the value of one custom field of an item. */
export async function setItemField(
	itemId: string,
	field: Field,
	value: FieldValue | null
): Promise<void> {
	if (value !== null && !isValidValue(field.type, value)) throw new Error('Valore non valido.');
	await db.transaction('rw', db.items, async () => {
		const item = await db.items.get(itemId);
		if (!item) return;
		const extra = { ...item.extra };
		if (value === null) delete extra[field.id];
		else extra[field.id] = value;
		await db.items.update(itemId, { extra, updatedAt: now() });
	});
}
