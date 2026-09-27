/**
 * Turns sheet rows into records keyed by the header row (the first row).
 *
 * The Sheets API drops trailing empty cells, so a row can be shorter than the
 * header: missing cells become empty strings. Completely empty rows are skipped.
 */
export function rowsToRecords(rows: string[][]): Record<string, string>[] {
	const [header, ...data] = rows;
	if (!header) return [];
	return data
		.filter((row) => row.some((cell) => cell !== ''))
		.map((row) => Object.fromEntries(header.map((key, i) => [key, row[i] ?? ''])));
}
