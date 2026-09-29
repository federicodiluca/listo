import { site } from '$lib/site';

/*
 * Structured data (schema.org, as JSON-LD): a machine-readable description of the page
 * that search engines and AI assistants use to understand what Listo is, who made it
 * and what the page answers.
 */

export type JsonLd = Record<string, unknown>;

const author = {
	'@type': 'Person',
	name: site.author.name,
	url: site.author.url
};

export function webApplication(): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: site.name,
		url: site.url,
		description:
			'App gratuita per liste personalizzabili in cui ogni elemento può stare in più categorie: inventario del congelatore, dispensa, lista della spesa.',
		applicationCategory: 'LifestyleApplication',
		operatingSystem: 'Android, iOS, Windows, macOS, Linux',
		browserRequirements: 'Browser moderno (Chrome, Edge, Safari, Firefox)',
		inLanguage: 'it',
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
		image: `${site.url}/og-image.png`,
		author,
		creator: author
	};
}

export type Faq = { question: string; answer: string };

export function faqPage(faqs: Faq[]): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: { '@type': 'Answer', text: faq.answer }
		}))
	};
}

/** Home › page, so results can show the site structure instead of a bare URL. */
export function breadcrumbs(label: string, path: string): JsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: site.name, item: `${site.url}/` },
			{ '@type': 'ListItem', position: 2, name: label, item: `${site.url}${path}` }
		]
	};
}
