import type { AccessToken } from './auth';

const API = 'https://sheets.googleapis.com/v4/spreadsheets';

export type Spreadsheet = { id: string; url: string; title: string };

export class SheetsError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}

async function call<T>(token: AccessToken, url: string, init: RequestInit = {}): Promise<T> {
	const response = await fetch(url, {
		...init,
		headers: {
			Authorization: `Bearer ${token.value}`,
			'Content-Type': 'application/json',
			...init.headers
		}
	});
	if (!response.ok) {
		const body = await response.json().catch(() => undefined);
		throw new SheetsError(response.status, body?.error?.message ?? response.statusText);
	}
	return response.json();
}

/** Creates a spreadsheet in the user's Drive, with one tab per name in `tabs`. */
export async function createSpreadsheet(
	token: AccessToken,
	title: string,
	tabs: string[]
): Promise<Spreadsheet> {
	const created = await call<{
		spreadsheetId: string;
		spreadsheetUrl: string;
		properties: { title: string };
	}>(token, API, {
		method: 'POST',
		body: JSON.stringify({
			properties: { title, locale: 'it_IT' },
			sheets: tabs.map((tab) => ({ properties: { title: tab } }))
		})
	});
	return {
		id: created.spreadsheetId,
		url: created.spreadsheetUrl,
		title: created.properties.title
	};
}

export async function getSpreadsheet(token: AccessToken, id: string): Promise<Spreadsheet> {
	const sheet = await call<{
		spreadsheetId: string;
		spreadsheetUrl: string;
		properties: { title: string };
	}>(token, `${API}/${id}?fields=spreadsheetId,spreadsheetUrl,properties.title`);
	return { id: sheet.spreadsheetId, url: sheet.spreadsheetUrl, title: sheet.properties.title };
}

/** Appends rows after the last non-empty row of `tab`. */
export async function appendRows(
	token: AccessToken,
	spreadsheetId: string,
	tab: string,
	rows: string[][]
): Promise<void> {
	const range = encodeURIComponent(`${tab}!A1`);
	// RAW: values are stored as typed. With USER_ENTERED, Sheets would "helpfully"
	// turn "2026-09-27" into a date serial number or "1/2" into a date.
	await call(
		token,
		`${API}/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
		{ method: 'POST', body: JSON.stringify({ values: rows }) }
	);
}

/** Reads every non-empty row of `tab`, as displayed strings (the default FORMATTED_VALUE). */
export async function readRows(
	token: AccessToken,
	spreadsheetId: string,
	tab: string
): Promise<string[][]> {
	const range = encodeURIComponent(tab);
	const result = await call<{ values?: string[][] }>(
		token,
		`${API}/${spreadsheetId}/values/${range}`
	);
	return result.values ?? [];
}
