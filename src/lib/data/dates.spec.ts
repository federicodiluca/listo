import { describe, expect, it } from 'vitest';
import { daysBetween, formatAge, formatDate, isCalendarDate, today } from './dates';

describe('today', () => {
	it('uses the local calendar day', () => {
		expect(today(new Date(2026, 0, 5, 0, 30))).toBe('2026-01-05');
		expect(today(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
	});
});

describe('isCalendarDate', () => {
	it('accepts real dates only', () => {
		expect(isCalendarDate('2026-09-27')).toBe(true);
		expect(isCalendarDate('2028-02-29')).toBe(true);
		expect(isCalendarDate('2026-02-29')).toBe(false);
		expect(isCalendarDate('2026-13-01')).toBe(false);
		expect(isCalendarDate('27/09/2026')).toBe(false);
		expect(isCalendarDate('')).toBe(false);
	});
});

describe('daysBetween', () => {
	it('counts calendar days, across months and daylight saving changes', () => {
		expect(daysBetween('2026-09-27', '2026-09-27')).toBe(0);
		expect(daysBetween('2026-09-30', '2026-10-01')).toBe(1);
		expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2); // clocks go forward on the 29th
		expect(daysBetween('2026-10-01', '2026-09-30')).toBe(-1);
	});
});

describe('formatAge', () => {
	it('uses friendly words for recent dates and coarser units later', () => {
		expect(formatAge('2026-09-27', '2026-09-27')).toBe('oggi');
		expect(formatAge('2026-09-26', '2026-09-27')).toBe('ieri');
		expect(formatAge('2026-09-17', '2026-09-27')).toBe('10 giorni fa');
		expect(formatAge('2026-06-27', '2026-09-27')).toBe('3 mesi fa');
		expect(formatAge('2023-09-27', '2026-09-27')).toBe('3 anni fa');
		expect(formatAge('2026-09-28', '2026-09-27')).toBe('in futuro');
	});
});

describe('formatDate', () => {
	it('formats in Italian', () => {
		expect(formatDate('2026-09-27')).toBe('27 set 2026');
	});
});
