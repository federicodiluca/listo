import type { Handle } from '@sveltejs/kit';

/** Public pages that search engines may index. Everything else is private by default. */
const indexable = new Set(['/']);

/**
 * Runs at build time, while pages are prerendered (there is no server in production).
 * App pages are client-only (ssr = false), so their <svelte:head> never reaches the
 * generated HTML: the noindex tag has to be written here, into the HTML itself.
 * Deny-by-default: a new page stays out of search results until listed above.
 */
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) =>
			indexable.has(event.url.pathname)
				? html
				: html.replace('<head>', '<head>\n\t\t<meta name="robots" content="noindex" />')
	});
