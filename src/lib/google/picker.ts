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
 * `onEvent` receives every raw callback action, for diagnostics.
 */
export async function pickSpreadsheet(
	token: AccessToken,
	onEvent?: (action: string) => void
): Promise<string | undefined> {
	await loadPicker();
	return new Promise((resolve) => {
		const shared = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setOwnedByMe(
			false
		);
		const mine = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setOwnedByMe(true);
		// setLabel is typed as returning a plain View, so it can't be chained here
		shared.setLabel('Condivisi con me');
		mine.setLabel('I miei fogli');
		new google.picker.PickerBuilder()
			.setAppId(googleConfig.appId)
			.setDeveloperKey(googleConfig.apiKey)
			.setOAuthToken(token.value)
			.setLocale('it')
			.addView(mine)
			.addView(shared)
			.setCallback((data: google.picker.ResponseObject) => {
				onEvent?.(data.action);
				if (data.action === google.picker.Action.PICKED) resolve(data.docs?.[0]?.id);
				else if (data.action === google.picker.Action.CANCEL) resolve(undefined);
			})
			.build()
			.setVisible(true);
	});
}
