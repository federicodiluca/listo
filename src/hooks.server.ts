import { indexablePaths } from '$lib/seo/pages';
import type { Handle } from '@sveltejs/kit';

/**
 * Runs at build time, while pages are prerendered (there is no server in production).
 * App pages are client-only (ssr = false), so their <svelte:head> never reaches the
 * generated HTML: the noindex tag has to be written here, into the HTML itself.
 * Deny-by-default: a new page stays out of search results until listed in
 * $lib/seo/pages.ts.
 */
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) =>
			indexablePaths.has(event.url.pathname)
				? html
				: html.replace('<head>', '<head>\n\t\t<meta name="robots" content="noindex" />')
	});
