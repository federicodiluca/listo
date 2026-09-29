<script lang="ts">
	import { page } from '$app/state';
	import { site } from '$lib/site';
	import type { JsonLd } from './jsonld';

	let {
		title,
		description,
		jsonLd = []
	}: {
		/** Full <title>: keep it under ~60 characters, most important words first. */
		title: string;
		/** Shown under the title in search results: ~150 characters, written for people. */
		description: string;
		jsonLd?: JsonLd[];
	} = $props();

	const canonical = $derived(`${site.url}${page.url.pathname === '/' ? '/' : page.url.pathname}`);
	const image = `${site.url}/og-image.png`;

	// JSON-LD goes in a <script> tag: built as a string, with "<" escaped so that
	// content can never close the tag early
	const scripts = $derived(
		jsonLd.map(
			(data) =>
				`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</` +
				'script>'
		)
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content={site.author.name} />
	<link rel="canonical" href={canonical} />

	<!-- Open Graph / social previews (WhatsApp, Telegram, LinkedIn, Facebook…) -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:locale" content="it_IT" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Listo: liste con categorie multiple" />
	<meta name="twitter:card" content="summary_large_image" />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON serialised above, "<" escaped -->
	{@html scripts.join('')}
</svelte:head>
