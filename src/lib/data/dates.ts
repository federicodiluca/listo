import type { CalendarDate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Today's date in the device's time zone. `new Date().toISOString()` would give the
 * UTC date instead: between midnight and 2am in Italy that is still "yesterday".
 */
export function today(now = new Date()): CalendarDate {
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isCalendarDate(value: string): value is CalendarDate {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [y, m, d] = value.split('-').map(Number);
	const date = new Date(Date.UTC(y, m - 1, d));
	// rejects 2026-02-30 & co., which Date would silently roll over to March
	return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Whole days from `from` to `to`; computed in UTC so daylight saving can't skew it. */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
	const utc = (date: CalendarDate) => {
		const [y, m, d] = date.split('-').map(Number);
		return Date.UTC(y, m - 1, d);
	};
	return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** "oggi", "ieri", "5 giorni fa", "3 mesi fa"… */
export function formatAge(addedOn: CalendarDate, reference: CalendarDate = today()): string {
	const days = daysBetween(addedOn, reference);
	if (days < 0) return 'in futuro';
	if (days === 0) return 'oggi';
	if (days === 1) return 'ieri';
	if (days < 60) return `${days} giorni fa`;
	const months = Math.floor(days / 30.44);
	if (months < 24) return `${months} mesi fa`;
	return `${Math.floor(days / 365.25)} anni fa`;
}

/** "27 set 2026" */
export function formatDate(date: CalendarDate): string {
	const [y, m, d] = date.split('-').map(Number);
	return new Date(y, m - 1, d).toLocaleDateString('it-IT', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

/** "adesso", "5 minuti fa", "2 ore fa", or the date for anything older than a day. */
export function formatRelativeTime(instant: string, now = new Date()): string {
	const minutes = Math.floor((now.getTime() - new Date(instant).getTime()) / 60_000);
	if (minutes < 1) return 'adesso';
	if (minutes === 1) return '1 minuto fa';
	if (minutes < 60) return `${minutes} minuti fa`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return hours === 1 ? '1 ora fa' : `${hours} ore fa`;
	return formatDate(today(new Date(instant)));
}
