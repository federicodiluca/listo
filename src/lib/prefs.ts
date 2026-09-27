/**
 * Per-device preferences in localStorage. They are conveniences (e.g. which list to
 * open first), never data: storage can be unavailable (private mode, blocked site
 * data), so every access is guarded and failure just means "no preference".
 */
const LAST_LIST = 'listo:last-list';

export function getLastListId(): string | null {
	try {
		return localStorage.getItem(LAST_LIST);
	} catch {
		return null;
	}
}

export function setLastListId(id: string | null): void {
	try {
		if (id) localStorage.setItem(LAST_LIST, id);
		else localStorage.removeItem(LAST_LIST);
	} catch {
		// not critical
	}
}
