import type { ColorName } from './palette';

/** Calendar date as `YYYY-MM-DD`: a day, not an instant, so it never shifts with time zones. */
export type CalendarDate = string;

/** Instant as an ISO 8601 string in UTC, e.g. `2026-09-27T13:45:00.000Z`. */
export type Timestamp = string;

export type List = {
	id: string;
	name: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
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
	updatedAt: Timestamp;
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
	archivedAt: Timestamp | null;
	createdAt: Timestamp;
	updatedAt: Timestamp;
};

/** What the user provides when creating a category; the rest is filled in by the app. */
export type CategoryDraft = Pick<Category, 'emoji' | 'name' | 'color'>;
