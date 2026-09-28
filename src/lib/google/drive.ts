import { googleFetch } from './api';
import type { AccessToken } from './auth';
import type { Spreadsheet } from './sheets';

const API = 'https://www.googleapis.com/drive/v3/files';

/**
 * Invisible property that marks Listo's data file. Searching by it, instead of by
 * name, keeps working if the user renames or moves the file in Drive.
 */
const MARK = { key: 'listo', value: 'dati' } as const;

/**
 * Finds the data file. With the `drive.file` scope only files created by Listo are
 * visible, and that grant belongs to the Google account, not to the device: a file
 * created on the PC is found from the phone too. If there are several (two devices
 * connected for the first time at once), the oldest wins.
 */
export async function findDataFile(token: AccessToken): Promise<Spreadsheet | null> {
	const params = new URLSearchParams({
		q: `appProperties has { key='${MARK.key}' and value='${MARK.value}' } and trashed = false`,
		fields: 'files(id, webViewLink)',
		orderBy: 'createdTime'
	});
	const { files } = await googleFetch<{ files: { id: string; webViewLink: string }[] }>(
		token,
		`${API}?${params}`
	);
	return files[0] ? { id: files[0].id, url: files[0].webViewLink } : null;
}

export async function markAsDataFile(token: AccessToken, fileId: string): Promise<void> {
	await googleFetch(token, `${API}/${fileId}`, {
		method: 'PATCH',
		body: JSON.stringify({ appProperties: { [MARK.key]: MARK.value } })
	});
}
