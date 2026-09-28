import { googleFetch } from './api';
import type { AccessToken } from './auth';

const API = 'https://sheets.googleapis.com/v4/spreadsheets';

export type Spreadsheet = { id: string; url: string };

/** Creates a spreadsheet with the given tabs, each with its first row frozen as a header. */
export async function createSpreadsheet(
	token: AccessToken,
	title: string,
	tabs: string[]
): Promise<Spreadsheet> {
	const created = await googleFetch<{ spreadsheetId: string; spreadsheetUrl: string }>(token, API, {
		method: 'POST',
		body: JSON.stringify({
			properties: { title, locale: 'it_IT' },
			sheets: tabs.map((title) => ({
				properties: { title, gridProperties: { frozenRowCount: 1 } }
			}))
		})
	});
	return { id: created.spreadsheetId, url: created.spreadsheetUrl };
}

/** Reads several whole tabs in one request, as displayed strings. */
export async function readTabs(
	token: AccessToken,
	spreadsheetId: string,
	tabs: string[]
): Promise<Record<string, string[][]>> {
	const params = new URLSearchParams(tabs.map((tab) => ['ranges', tab]));
	const result = await googleFetch<{ valueRanges: { values?: string[][] }[] }>(
		token,
		`${API}/${spreadsheetId}/values:batchGet?${params}`
	);
	return Object.fromEntries(tabs.map((tab, i) => [tab, result.valueRanges[i]?.values ?? []]));
}

/**
 * Overwrites several tabs in one request. Tabs that used to have more rows get
 * blank rows appended, which clears the leftovers without a separate "clear" call:
 * a single request means the sheet is never seen half-written.
 */
export async function writeTabs(
	token: AccessToken,
	spreadsheetId: string,
	tabs: Record<string, string[][]>,
	previousRowCounts: Record<string, number> = {}
): Promise<void> {
	const data = Object.entries(tabs).map(([tab, rows]) => {
		const width = Math.max(0, ...rows.map((row) => row.length));
		const padding = Math.max(0, (previousRowCounts[tab] ?? 0) - rows.length);
		const blank = Array.from({ length: padding }, () => Array<string>(width).fill(''));
		return { range: `${tab}!A1`, values: [...rows, ...blank] };
	});
	// RAW: values are stored as typed. With USER_ENTERED, Sheets would "helpfully"
	// turn "2026-09-27" into a date serial number or "1/2" into a date.
	await googleFetch(token, `${API}/${spreadsheetId}/values:batchUpdate`, {
		method: 'POST',
		body: JSON.stringify({ valueInputOption: 'RAW', data })
	});
}
