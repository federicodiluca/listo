import { daysBetween, formatDate, isCalendarDate, today } from './dates';
import type {
	CalendarDate,
	Duration,
	Field,
	FieldType,
	FieldValue,
	FieldValues,
	Item
} from './types';

export const fieldTypes: { type: FieldType; label: string; hint: string }[] = [
	{ type: 'date', label: 'Data', hint: 'es. Scadenza, Entro il' },
	{ type: 'duration', label: 'Durata', hint: 'es. Si conserva per 6 mesi' },
	{ type: 'number', label: 'Numero', hint: 'es. Prezzo, Calorie' },
	{ type: 'text', label: 'Testo', hint: 'es. Marca, Posizione' },
	{ type: 'boolean', label: 'Sì/No', hint: 'es. Fatto in casa, Letto' }
];

export const canBeExpiry = (type: FieldType) => type === 'date' || type === 'duration';

const isDuration = (value: unknown): value is Duration =>
	typeof value === 'object' &&
	value !== null &&
	Number.isInteger((value as Duration).amount) &&
	(value as Duration).amount > 0 &&
	['days', 'months'].includes((value as Duration).unit);

/** Whether `value` is a valid value for a field of this type (used on input and on import). */
export function isValidValue(type: FieldType, value: unknown): value is FieldValue {
	switch (type) {
		case 'date':
			return typeof value === 'string' && isCalendarDate(value);
		case 'duration':
			return isDuration(value);
		case 'number':
			return typeof value === 'number' && Number.isFinite(value);
		case 'text':
			return typeof value === 'string' && value.trim() !== '';
		case 'boolean':
			return typeof value === 'boolean';
	}
}

/**
 * Adds a duration to a calendar date. Months are calendar months, clamped to the end
 * of the target month: 31 January + 1 month is 28/29 February, not 3 March (which is
 * what the Date object would say, rolling the missing days over).
 */
export function addDuration(date: CalendarDate, duration: Duration): CalendarDate {
	const [y, m, d] = date.split('-').map(Number);
	const utc =
		duration.unit === 'days'
			? new Date(Date.UTC(y, m - 1, d + duration.amount))
			: (() => {
					const target = new Date(Date.UTC(y, m - 1 + duration.amount, 1));
					const lastDay = new Date(
						Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
					).getUTCDate();
					target.setUTCDate(Math.min(d, lastDay));
					return target;
				})();
	return utc.toISOString().slice(0, 10);
}

/**
 * The item's expiry date: from the first expiry field (in the user's order) that has a
 * value. A date is the expiry itself; a duration counts from the day the item was added.
 */
export function expiryOf(item: Item, fields: readonly Field[]): CalendarDate | null {
	for (const field of fields) {
		if (!field.expiry) continue;
		const value = item.extra[field.id];
		if (field.type === 'date' && isValidValue('date', value)) return value as CalendarDate;
		if (field.type === 'duration' && isDuration(value)) return addDuration(item.addedOn, value);
	}
	return null;
}

export type ExpiryStatus = 'expired' | 'soon' | 'ok';

export function expiryStatus(
	expiry: CalendarDate,
	warningDays: number,
	reference: CalendarDate = today()
): ExpiryStatus {
	const left = daysBetween(reference, expiry);
	if (left < 0) return 'expired';
	return left <= warningDays ? 'soon' : 'ok';
}

/** "scade oggi", "scade tra 5 giorni", "scaduto da 3 giorni", "scade il 10 dic 2026". */
export function describeExpiry(expiry: CalendarDate, reference: CalendarDate = today()): string {
	const left = daysBetween(reference, expiry);
	if (left < -1) return `scaduto da ${-left} giorni`;
	if (left === -1) return 'scaduto ieri';
	if (left === 0) return 'scade oggi';
	if (left === 1) return 'scade domani';
	if (left <= 60) return `scade tra ${left} giorni`;
	return `scade il ${formatDate(expiry)}`;
}

export function formatDuration({ amount, unit }: Duration): string {
	if (unit === 'days') return amount === 1 ? '1 giorno' : `${amount} giorni`;
	return amount === 1 ? '1 mese' : `${amount} mesi`;
}

/** Human-readable value, or '' when there is nothing to show (e.g. a "no" boolean). */
export function formatFieldValue(field: Field, value: FieldValue | undefined): string {
	if (value === undefined || !isValidValue(field.type, value)) return '';
	switch (field.type) {
		case 'date':
			return `${field.name}: ${formatDate(value as CalendarDate)}`;
		case 'duration':
			return `${field.name}: ${formatDuration(value as Duration)}`;
		case 'number':
			return `${field.name}: ${(value as number).toLocaleString('it-IT', { maximumFractionDigits: 2 })}`;
		case 'text':
			return value as string;
		case 'boolean':
			return value ? field.name : '';
	}
}

/**
 * Fills the item's empty fields with a category's defaults; values the user already
 * entered are never overwritten. Returns null when nothing changes.
 */
export function withDefaults(extra: FieldValues, defaults: FieldValues): FieldValues | null {
	const missing = Object.entries(defaults).filter(([fieldId]) => !(fieldId in extra));
	return missing.length ? { ...extra, ...Object.fromEntries(missing) } : null;
}
