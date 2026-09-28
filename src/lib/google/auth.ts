import { googleConfig } from './config';
import { loadScript } from './load-script';

/**
 * Only files this app creates (or that the user explicitly opens with it).
 * It is a "non-sensitive" scope: no Google verification needed, and the app can't
 * see anything else in the user's Drive.
 */
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

export type AccessToken = { value: string; expiresAt: number };

/**
 * The token is kept in localStorage for its lifetime (about an hour), so reopening the
 * app doesn't need a new popup. A trade-off: a script injected into the page could read
 * it, but it only grants access to Listo's own files and expires by itself.
 */
const STORAGE_KEY = 'listo:google-token';
const MARGIN = 60_000; // treat as expired a minute early, not halfway through a sync

export function storedToken(): AccessToken | null {
	try {
		const token = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as AccessToken | null;
		return token && token.expiresAt - MARGIN > Date.now() ? token : null;
	} catch {
		return null;
	}
}

function storeToken(token: AccessToken | null) {
	try {
		if (token) localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
		else localStorage.removeItem(STORAGE_KEY);
	} catch {
		// storage unavailable: the token lives in memory only for this session
	}
}

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
				const token = {
					value: response.access_token,
					expiresAt: Date.now() + Number(response.expires_in) * 1000
				};
				storeToken(token);
				pendingRequest?.resolve(token);
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
 * browser-only app: when it expires we simply ask again. Opens a popup, so it must be
 * called from a user gesture (a tap), or the browser blocks it.
 *
 * - `consent`: always shows the account/consent popup (first connection).
 * - `silent`: the popup closes by itself if access was already granted.
 */
export async function requestAccessToken(mode: 'consent' | 'silent'): Promise<AccessToken> {
	const tokenClient = await getClient();
	return new Promise((resolve, reject) => {
		pendingRequest = { resolve, reject };
		tokenClient.requestAccessToken({ prompt: mode === 'consent' ? 'consent' : '' });
	});
}

/** Forgets the token and tells Google to invalidate it. */
export async function revokeAccessToken(): Promise<void> {
	const token = storedToken();
	storeToken(null);
	if (!token) return;
	await loadScript('https://accounts.google.com/gsi/client');
	await new Promise<void>((resolve) => google.accounts.oauth2.revoke(token.value, () => resolve()));
}
