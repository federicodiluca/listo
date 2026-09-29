<script lang="ts">
	import { resolve } from '$app/paths';
	import { breadcrumbs, faqPage, webApplication, type Faq } from '$lib/seo/jsonld';
	import Seo from '$lib/seo/Seo.svelte';
	import { templates } from '$lib/data/templates';
	import CategoryChip from '$lib/ui/CategoryChip.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import InstallButton from '$lib/ui/InstallButton.svelte';
	import type { Snippet } from 'svelte';
	import FaqList from './FaqList.svelte';

	/**
	 * Shared layout of the use-case pages (freezer, pantry, shopping list): each page
	 * brings its own text; this component adds SEO, the template's categories and the
	 * calls to action that open the app with that template already chosen.
	 */
	let {
		path,
		label,
		title,
		description,
		heading,
		intro,
		template: templateId,
		faqs,
		children
	}: {
		path: string;
		label: string;
		title: string;
		description: string;
		heading: string;
		intro: string;
		template: string;
		faqs: Faq[];
		children: Snippet;
	} = $props();

	const template = $derived(templates.find((t) => t.id === templateId)!);
	const start = $derived(`${resolve('/app/nuova')}?modello=${templateId}`);
	const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium';
</script>

<Seo {title} {description} jsonLd={[webApplication(), breadcrumbs(label, path), faqPage(faqs)]} />

<!-- eslint-disable svelte/no-navigation-without-resolve -- `start` is built with resolve() -->
<main>
	<section class="mx-auto max-w-3xl px-4 pt-10 pb-6">
		<nav class="text-sm text-muted" aria-label="Percorso">
			<a class="hover:text-ink" href={resolve('/')}>Listo</a> <span aria-hidden="true">›</span>
			<span aria-current="page">{label}</span>
		</nav>
		<span class="mt-8 grid size-14 place-items-center rounded-2xl bg-surface text-accent">
			<Icon name={template.icon} size={30} />
		</span>
		<h1 class="mt-5 text-4xl leading-tight font-bold sm:text-5xl">{heading}</h1>
		<p class="mt-5 text-lg text-muted">{intro}</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<a href={start} class="{btn} bg-primary text-on-primary">
				Crea la lista {template.name}
			</a>
			<InstallButton class="{btn} border border-line bg-surface" />
		</div>
	</section>

	<article
		class="mx-auto max-w-3xl px-4 py-6 text-lg [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:mt-2 [&_p]:mt-4 [&_p]:text-muted [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted"
	>
		{@render children()}

		{#if template.categories.length}
			<h2>Le categorie del modello «{template.name}»</h2>
			<p>
				Creando la lista da questo modello parti con queste categorie. Puoi rinominarle, cambiarne
				emoji e colore, riordinarle o aggiungerne altre.
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each template.categories as category (category.name)}
					<CategoryChip {category} />
				{/each}
			</div>
		{/if}
	</article>

	<FaqList {faqs} />

	<section class="mx-auto max-w-3xl px-4 py-8 text-center">
		<h2 class="text-2xl font-bold">Inizia adesso, è gratis</h2>
		<p class="mt-3 text-muted">Senza registrazione: la lista resta sul tuo telefono.</p>
		<a href={start} class="{btn} mt-6 bg-primary text-on-primary">
			Crea la lista {template.name}
		</a>
	</section>
</main>
