import type { AccessToken } from './auth';
import { GoogleApiError, type Spreadsheet } from './sheets';

const API = 'https://www.googleapis.com/drive/v3/files';

/**
 * Lists the spreadsheets this app can see. With the `drive.file` scope that means
 * only the ones Listo created: the grant belongs to the Google account, not to the
 * device, so a sheet created on the PC is found from the phone as well.
 */
export async function listSpreadsheets(token: AccessToken): Promise<Spreadsheet[]> {
	const params = new URLSearchParams({
		q: "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
		fields: 'files(id, name, webViewLink)',
		orderBy: 'modifiedTime desc'
	});
	const response = await fetch(`${API}?${params}`, {
		headers: { Authorization: `Bearer ${token.value}` }
	});
	if (!response.ok) {
		const body = await response.json().catch(() => undefined);
		throw new GoogleApiError(response.status, body?.error?.message ?? response.statusText);
	}
	const { files } = (await response.json()) as {
		files: { id: string; name: string; webViewLink: string }[];
	};
	return files.map((file) => ({ id: file.id, title: file.name, url: file.webViewLink }));
}
