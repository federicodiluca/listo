import type { ColorName } from './palette';

/** Calendar date as `YYYY-MM-DD`: a day, not an instant, so it never shifts with time zones. */
export type CalendarDate = string;

/** Instant as an ISO 8601 string in UTC, e.g. `2026-09-27T13:45:00.000Z`. */
export type Timestamp = string;

export type SortField = 'addedOn' | 'name' | 'quantity' | 'category' | 'expiry';

export type ListSort = { field: SortField; direction: 'asc' | 'desc' };

export const defaultSort: ListSort = { field: 'addedOn', direction: 'asc' };

export type List = {
	id: string;
	name: string;
	/** How items are ordered; remembered per list. Added in schema version 2. */
	sort: ListSort;
	/** Items expiring within this many days are highlighted. Schema v4. */
	expiryWarningDays: number;
	createdAt: Timestamp;
	updatedAt: Timestamp;
	/** Set when deleted: the record stays as a tombstone so the deletion can sync. Schema v3. */
	deletedAt: Timestamp | null;
};

export type Category = {
	id: string;
	listId: string;
	/** Optional single emoji shown before the name, e.g. 🥦. Empty string when unset. */
	emoji: string;
	name: string;
	color: ColorName;
	/** Sort order within the list: 0, 1, 2… */
	position: number;
	/**
	 * Values filled into an item's empty fields when it gets this category, keyed by
	 * field id (e.g. "Carne" → "Si conserva per: 6 mesi"). Schema v4.
	 */
	defaults: FieldValues;
	updatedAt: Timestamp;
	/** Set when deleted: the record stays as a tombstone so the deletion can sync. Schema v3. */
	deletedAt: Timestamp | null;
};

export type Item = {
	id: string;
	listId: string;
	name: string;
	/** `null` when the user doesn't care about quantity. Decimals allowed (0.5 kg). */
	quantity: number | null;
	/** Free text: "porzioni", "g", "sacchetti"… Empty string when unset. */
	unit: string;
	/** An item can belong to any number of categories of its list. */
	categoryIds: string[];
	addedOn: CalendarDate;
	note: string;
	/** Values of the list's custom fields, keyed by field id; missing = empty. Schema v4. */
	extra: FieldValues;
	archivedAt: Timestamp | null;
	createdAt: Timestamp;
	updatedAt: Timestamp;
	/** Set when deleted: the record stays as a tombstone so the deletion can sync. Schema v3. */
	deletedAt: Timestamp | null;
};

export type FieldType = 'date' | 'duration' | 'number' | 'text' | 'boolean';

export type Duration = { amount: number; unit: 'days' | 'months' };

/** date → CalendarDate, duration → Duration, number, text → string, boolean. */
export type FieldValue = CalendarDate | Duration | number | string | boolean;

export type FieldValues = Record<string, FieldValue>;

/** A custom field of a list's items, e.g. "Scadenza" (date) or "Autore" (text). Schema v4. */
export type Field = {
	id: string;
	listId: string;
	name: string;
	/** Fixed at creation: changing it would make existing values meaningless. */
	type: FieldType;
	/**
	 * Date and duration fields only: the value is (or gives, counting from the date the
	 * item was added) an expiry date, which the list highlights, sorts and filters by.
	 */
	expiry: boolean;
	/** Also shown in the item rows of the list, not only on the item page. */
	showInList: boolean;
	position: number;
	updatedAt: Timestamp;
	deletedAt: Timestamp | null;
};

export type FieldDraft = Pick<Field, 'name' | 'type' | 'expiry' | 'showInList'>;

/** Every synced record has these. */
export type SyncedRecord = { id: string; updatedAt: Timestamp; deletedAt: Timestamp | null };

/** Item fields the user edits; the rest (ids, timestamps) is managed by the app. */
export type ItemDraft = Pick<
	Item,
	'name' | 'quantity' | 'unit' | 'categoryIds' | 'addedOn' | 'note' | 'extra'
>;

/** What the user provides when creating a category; the rest is filled in by the app. */
export type CategoryDraft = Pick<Category, 'emoji' | 'name' | 'color'>;
