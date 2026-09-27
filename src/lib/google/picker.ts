import { googleConfig } from './config';
import type { AccessToken } from './auth';
import { loadScript } from './load-script';

async function loadPicker(): Promise<void> {
	await loadScript('https://apis.google.com/js/api.js');
	await new Promise<void>((resolve) => gapi.load('picker', () => resolve()));
}

/**
 * Lets the user choose a spreadsheet from their Drive, including ones shared with
 * them. With the `drive.file` scope, picking a file is what grants this app access
 * to it: it's how a shared list becomes readable by the person it was shared with.
 *
 * Resolves with the file id, or `undefined` if the user closed the picker.
 */
export async function pickSpreadsheet(token: AccessToken): Promise<string | undefined> {
	await loadPicker();
	return new Promise((resolve) => {
		const mine = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setOwnedByMe(true);
		const shared = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setOwnedByMe(
			false
		);
		new google.picker.PickerBuilder()
			.setAppId(googleConfig.appId)
			.setDeveloperKey(googleConfig.apiKey)
			.setOAuthToken(token.value)
			.setLocale('it')
			.addView(shared)
			.addView(mine)
			.setCallback((data: google.picker.ResponseObject) => {
				if (data.action === google.picker.Action.PICKED) resolve(data.docs?.[0]?.id);
				else if (data.action === google.picker.Action.CANCEL) resolve(undefined);
			})
			.build()
			.setVisible(true);
	});
}
