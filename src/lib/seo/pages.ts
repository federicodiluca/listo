/**
 * The public, indexable pages. Single source of truth for the sitemap, the build-time
 * noindex hook (every page not listed here is private) and the site navigation.
 */
export type PublicPage = {
	path: string;
	/** Short label for navigation and breadcrumbs. */
	label: string;
	/** 0.0–1.0 hint for crawlers about relative importance within the site. */
	priority: number;
};

export const publicPages: PublicPage[] = [
	{ path: '/', label: 'Home', priority: 1 },
	{ path: '/congelatore', label: 'Congelatore', priority: 0.8 },
	{ path: '/dispensa', label: 'Dispensa', priority: 0.8 },
	{ path: '/lista-della-spesa', label: 'Lista della spesa', priority: 0.8 },
	{ path: '/privacy', label: 'Privacy', priority: 0.3 }
];

/** The three use-case pages, in navigation order. */
export const useCasePages = publicPages.filter((p) =>
	['/congelatore', '/dispensa', '/lista-della-spesa'].includes(p.path)
);

export const indexablePaths = new Set(publicPages.map((p) => p.path));
