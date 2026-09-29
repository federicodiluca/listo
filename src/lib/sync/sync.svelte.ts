import { db } from '$lib/data/db';
import { GoogleApiError } from '$lib/google/api';
import {
	prepareAuth,
	requestAccessToken,
	revokeAccessToken,
	storedToken,
	type AccessToken
} from '$lib/google/auth';
import { isGoogleConfigured } from '$lib/google/config';
import { findDataFile, markAsDataFile } from '$lib/google/drive';
import { createSpreadsheet, readTabs, writeTabs, type Spreadsheet } from '$lib/google/sheets';
import { liveQuery } from 'dexie';
import { syncOnce, type SheetStore } from './engine';
import { TABS, toSheet } from './format';

export type SyncStatus =
	| 'off' // not connected to Google
	| 'idle' // connected, nothing to do
	| 'syncing'
	| 'offline'
	| 'needs-auth' // access expired: a tap is needed to renew it
	| 'error';

type Settings = {
	enabled: boolean;
	file: Spreadsheet | null;
	/** When the last sync completed, for display. */
	lastSyncedAt: string | null;
	/** Newest updatedAt included in the last sync: anything newer is pending. */
	syncedUpTo: string;
};

const defaults = (): Settings => ({
	enabled: false,
	file: null,
	lastSyncedAt: null,
	syncedUpTo: ''
});

const SETTINGS_KEY = 'listo:sync';
const DEBOUNCE = 3000;

function loadSettings(): Settings {
	try {
		const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
		if (saved) return { ...defaults(), ...saved };
	} catch {
		// fall through to defaults
	}
	return defaults();
}

function saveSettings(settings: Settings) {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch {
		// not critical: the next session will just find the file again
	}
}

/** Most recent change in the local database, tombstones included. */
async function latestLocalChange(): Promise<string> {
	let latest = '';
	for (const table of [db.lists, db.categories, db.items, db.fields] as const) {
		await table.each((record) => {
			if (record.updatedAt > latest) latest = record.updatedAt;
		});
	}
	return latest;
}

/** Finds Listo's file in Drive, or creates it (with headers) on the first connection. */
async function openDataFile(token: AccessToken): Promise<Spreadsheet> {
	const existing = await findDataFile(token);
	if (existing) return existing;
	const created = await createSpreadsheet(token, 'Listo', Object.values(TABS));
	await markAsDataFile(token, created.id);
	await writeTabs(token, created.id, toSheet({ lists: [], categories: [], items: [], fields: [] }));
	return created;
}

const googleStore = (token: AccessToken, file: Spreadsheet): SheetStore => ({
	read: () => readTabs(token, file.id, Object.values(TABS)),
	write: (tabs, previous) => writeTabs(token, file.id, tabs, previous)
});

/**
 * Coordinates syncing for the whole app: one instance, started by the app layout.
 * The UI reads its state (status, lastSyncedAt…) and calls connect / syncNow /
 * disconnect; everything else (when to sync) is decided here.
 */
class SyncController {
	status = $state<SyncStatus>('off');
	error = $state('');
	lastSyncedAt = $state<string | null>(null);
	fileUrl = $state<string | null>(null);
	/** Local changes not yet sent. */
	pending = $state(false);

	#settings = defaults();
	#latest = '';
	#started = false;
	#running: Promise<void> | null = null;
	#again = false;
	#timer: ReturnType<typeof setTimeout> | undefined;

	get enabled() {
		return this.#settings.enabled;
	}

	/** Called once when the app opens. */
	start() {
		if (this.#started || !isGoogleConfigured) return;
		this.#started = true;
		this.#settings = loadSettings();
		this.#publish();

		// Any local change moves the latest updatedAt forward: schedule a sync shortly
		// after, so that a burst of edits becomes a single upload.
		liveQuery(latestLocalChange).subscribe((latest) => {
			this.#latest = latest;
			this.#checkPending();
		});
		addEventListener('online', () => this.sync());
		addEventListener('offline', () => this.enabled && (this.status = 'offline'));
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') this.sync();
		});

		if (this.enabled) {
			prepareAuth().catch(() => {});
			this.sync();
		}
	}

	/** First connection. Must run from a tap: it opens Google's consent popup. */
	async connect() {
		this.error = '';
		try {
			await requestAccessToken('consent');
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Accesso non riuscito.';
			return;
		}
		this.#settings.enabled = true;
		this.#publish();
		await this.sync();
	}

	/** "Sincronizza ora": renews the access first if it expired. Must run from a tap. */
	async syncNow() {
		if (!storedToken()) {
			try {
				await requestAccessToken('silent');
			} catch (e) {
				this.status = 'needs-auth';
				this.error = e instanceof Error ? e.message : 'Accesso non riuscito.';
				return;
			}
		}
		await this.sync();
	}

	/** Stops syncing. Local data and the sheet in Drive are both kept. */
	async disconnect() {
		clearTimeout(this.#timer);
		await revokeAccessToken().catch(() => {});
		this.#settings = defaults();
		this.error = '';
		this.#publish();
	}

	/** Runs a sync now; if one is already running, runs another right after it. */
	sync(): Promise<void> {
		if (!this.enabled) return Promise.resolve();
		if (this.#running) {
			this.#again = true;
			return this.#running;
		}
		this.#running = this.#run().finally(() => {
			this.#running = null;
			if (this.#again) {
				this.#again = false;
				this.sync();
			}
		});
		return this.#running;
	}

	/** Local changes newer than the last sync? Then sync shortly (a burst of edits = one upload). */
	#checkPending() {
		this.pending = this.#latest > this.#settings.syncedUpTo;
		clearTimeout(this.#timer);
		if (this.pending && this.enabled) this.#timer = setTimeout(() => this.sync(), DEBOUNCE);
	}

	async #run() {
		clearTimeout(this.#timer);
		if (!navigator.onLine) {
			this.status = 'offline';
			return;
		}
		const token = storedToken();
		if (!token) {
			this.status = 'needs-auth';
			return;
		}
		this.status = 'syncing';
		try {
			await this.#syncWith(token);
			this.error = '';
			this.status = 'idle';
		} catch (e) {
			this.#fail(e);
		}
	}

	async #syncWith(token: AccessToken, retried = false): Promise<void> {
		const file = this.#settings.file ?? (await openDataFile(token));
		if (!this.#settings.file) {
			this.#settings.file = file;
			this.#publish();
		}
		let syncedUpTo: string;
		try {
			({ syncedUpTo } = await syncOnce(db, googleStore(token, file)));
		} catch (e) {
			// the file was deleted or trashed in Drive: find or create it again, once
			if (e instanceof GoogleApiError && e.status === 404 && !retried) {
				this.#settings.file = null;
				return this.#syncWith(token, true);
			}
			throw e;
		}
		this.#settings.lastSyncedAt = new Date().toISOString();
		this.#settings.syncedUpTo = syncedUpTo;
		this.#publish();
		// edits made during the sync are newer than syncedUpTo: they'll go in the next one
		this.#checkPending();
	}

	#fail(e: unknown) {
		if (e instanceof GoogleApiError && (e.status === 401 || e.status === 403)) {
			revokeAccessToken().catch(() => {});
			this.status = 'needs-auth';
			return;
		}
		if (e instanceof TypeError) {
			// fetch() rejects with TypeError when the network is unreachable
			this.status = 'offline';
			return;
		}
		this.status = 'error';
		this.error = e instanceof Error ? e.message : 'Sincronizzazione non riuscita.';
	}

	/** Saves settings and mirrors them into the reactive fields. */
	#publish() {
		saveSettings(this.#settings);
		this.lastSyncedAt = this.#settings.lastSyncedAt;
		this.fileUrl = this.#settings.file?.url ?? null;
		if (!this.enabled) this.status = 'off';
		else if (this.status === 'off') this.status = 'idle';
	}
}

export const sync = new SyncController();
