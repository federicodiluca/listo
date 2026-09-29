import { publicPages } from '$lib/seo/pages';
import { site } from '$lib/site';

// Generated at build time into build/sitemap.xml, from the same list that decides
// which pages are indexable: the two can't drift apart.
export const prerender = true;

export function GET() {
	const today = new Date().toISOString().slice(0, 10);
	const urls = publicPages
		.map(
			(page) =>
				`  <url>\n    <loc>${site.url}${page.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${page.priority.toFixed(1)}</priority>\n  </url>`
		)
		.join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
