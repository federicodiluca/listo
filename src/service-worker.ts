/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

/*
 * Makes the app work offline. The data already lives in IndexedDB: what is cached here
 * is the app itself (pages, JavaScript, CSS, icons), so it can start without a network.
 * Requests to Google are left alone: sync handles being offline on its own.
 */
import { build, files, prerendered, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

// One cache per deployed version: a new version starts clean and deletes the old one
const CACHE = `listo-${version}`;

/** Built JS/CSS (hashed names: their content never changes) and files from static/. */
const ASSETS = new Set([...build, ...files]);

/**
 * Pages to have ready offline. 404.html is the SPA shell GitHub Pages serves for
 * routes that aren't files, like /app/lista/<id>; env.js holds the public config.
 */
const PAGES = [...prerendered, '/404.html', '/_app/env.js'];

/** How long to wait for the network before falling back to the cached page. */
const NETWORK_TIMEOUT = 3000;

sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			await cache.addAll([...ASSETS]);
			// one at a time and tolerant: a page missing on this server must not
			// prevent the whole installation (e.g. no 404.html in `vite preview`)
			await Promise.allSettled(PAGES.map((page) => cache.add(page)));
			await sw.skipWaiting();
		})()
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
			await sw.clients.claim();
		})()
	);
});

/** Network first, but give up after `ms` so a weak signal doesn't leave the app hanging. */
async function fetchWithTimeout(request: Request, ms: number): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), ms);
	try {
		return await fetch(request, { signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

async function fromNetworkOrCache(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);
	try {
		const response = await fetchWithTimeout(request, NETWORK_TIMEOUT);
		// keep a fresh copy of pages that exist (GitHub Pages answers 404 for app routes)
		if (response.ok) await cache.put(request, response.clone());
		return response;
	} catch {
		const cached =
			(await cache.match(request, { ignoreSearch: true })) ??
			(request.mode === 'navigate' ? await cache.match('/404.html') : undefined);
		if (cached) return cached;
		return new Response('Offline', { status: 503, statusText: 'Offline' });
	}
}

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== location.origin) return;

	if (ASSETS.has(url.pathname)) {
		event.respondWith(caches.match(url.pathname).then((cached) => cached ?? fetch(request)));
		return;
	}
	event.respondWith(fromNetworkOrCache(request));
});
