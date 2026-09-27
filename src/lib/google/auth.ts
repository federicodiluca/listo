import { googleConfig } from './config';
import { loadScript } from './load-script';

/**
 * Only files this app creates, or that the user explicitly opens through the Picker.
 * It is a "non-sensitive" scope: no Google verification needed, and the app can't
 * see anything else in the user's Drive.
 */
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

export type AccessToken = { value: string; expiresAt: number };

let client: google.accounts.oauth2.TokenClient | undefined;
let pendingRequest:
	{ resolve: (token: AccessToken) => void; reject: (error: Error) => void } | undefined;

async function getClient(): Promise<google.accounts.oauth2.TokenClient> {
	if (client) return client;
	await loadScript('https://accounts.google.com/gsi/client');
	client = google.accounts.oauth2.initTokenClient({
		client_id: googleConfig.clientId,
		scope: SCOPE,
		callback: (response) => {
			if (response.error) {
				pendingRequest?.reject(new Error(response.error_description ?? response.error));
			} else {
				pendingRequest?.resolve({
					value: response.access_token,
					expiresAt: Date.now() + Number(response.expires_in) * 1000
				});
			}
			pendingRequest = undefined;
		},
		error_callback: (error) => {
			// e.g. the user closed the popup, or the browser blocked it
			pendingRequest?.reject(new Error(error.message ?? error.type));
			pendingRequest = undefined;
		}
	});
	return client;
}

/**
 * Asks Google for an access token (valid ~1 hour). There is no refresh token in a
 * browser-only app: when it expires we simply ask again.
 *
 * - `consent`: always shows the account/consent popup (first login).
 * - `silent`: shows no UI if the user already granted access; this is what we want
 *   to use for renewals, and what the prototype has to validate on Android.
 */
export async function requestAccessToken(mode: 'consent' | 'silent'): Promise<AccessToken> {
	const tokenClient = await getClient();
	return new Promise((resolve, reject) => {
		pendingRequest = { resolve, reject };
		tokenClient.requestAccessToken({ prompt: mode === 'consent' ? 'consent' : '' });
	});
}

export function revokeAccessToken(token: AccessToken): Promise<void> {
	return new Promise((resolve) => google.accounts.oauth2.revoke(token.value, () => resolve()));
}
