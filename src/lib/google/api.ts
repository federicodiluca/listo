import type { AccessToken } from './auth';

export class GoogleApiError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}

/** Authenticated JSON request to a Google API; non-2xx responses become GoogleApiError. */
export async function googleFetch<T>(
	token: AccessToken,
	url: string,
	init: RequestInit = {}
): Promise<T> {
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
		throw new GoogleApiError(response.status, body?.error?.message ?? response.statusText);
	}
	return response.json();
}
