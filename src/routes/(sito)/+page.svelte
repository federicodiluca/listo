<script lang="ts">
	import { resolve } from '$app/paths';
	import { templates } from '$lib/data/templates';
	import { faqPage, webApplication, type Faq } from '$lib/seo/jsonld';
	import Seo from '$lib/seo/Seo.svelte';
	import AppPreview from '$lib/site-ui/AppPreview.svelte';
	import FaqList from '$lib/site-ui/FaqList.svelte';
	import Icon, { type IconName } from '$lib/ui/Icon.svelte';
	import InstallButton from '$lib/ui/InstallButton.svelte';

	const features: { icon: IconName; title: string; text: string }[] = [
		{
			icon: 'tag',
			title: 'Più categorie per ogni elemento',
			text: 'Il minestrone sta sia in «Verdura» sia in «Piatti pronti». Filtri per quello che ti serve e lo trovi comunque.'
		},
		{
			icon: 'items',
			title: 'Tutte le liste che vuoi',
			text: 'Congelatore, dispensa, spesa, cantina: ogni lista ha le sue categorie, decise da te, con emoji e colori.'
		},
		{
			icon: 'offline',
			title: 'Funziona anche offline',
			text: 'Al supermercato con una tacca di segnale? Listo si apre lo stesso e ti mostra cosa hai già a casa.'
		},
		{
			icon: 'cloud',
			title: 'Sincronizzata col tuo Google Drive',
			text: 'Se vuoi, telefono e computer restano allineati tramite un foglio nel tuo Drive. Nessun account da creare.'
		},
		{
			icon: 'restore',
			title: 'Ripesca quello che ricompri',
			text: 'Quando finisci qualcosa lo archivi. La volta dopo lo ritrovi mentre scrivi, con le sue categorie già pronte.'
		},
		{
			icon: 'settings',
			title: 'Campi su misura e scadenze',
			text: 'Aggiungi i campi che ti servono: scadenza, durata di conservazione, marca, posizione. Listo ti mostra cosa sta per scadere.'
		}
	];

	/** Non-food templates, to show that lists are not only for the kitchen. */
	const otherTemplates = templates.filter(
		(t) => t.group === 'oggetti' || t.group === 'organizzazione' || t.id === 'medicinali'
	);

	const useCases = [
		{
			path: '/congelatore',
			icon: 'snowflake' as const,
			title: 'Inventario del congelatore',
			text: 'Sai cosa c’è nei cassetti e da quando, senza aprire lo sportello.'
		},
		{
			path: '/dispensa',
			icon: 'jar' as const,
			title: 'Scorte della dispensa',
			text: 'Pasta, conserve, legumi: vedi cosa sta finendo prima che finisca.'
		},
		{
			path: '/lista-della-spesa',
			icon: 'cart' as const,
			title: 'Lista della spesa',
			text: 'Divisa per reparto, con quello che ti manca davvero.'
		}
	];

	const faqs: Faq[] = [
		{
			question: 'Listo è gratis?',
			answer:
				'Sì, completamente: nessun abbonamento, nessuna pubblicità, nessuna funzione a pagamento.'
		},
		{
			question: 'Serve creare un account?',
			answer:
				'No. Apri l’app e crei la tua prima lista. Se vuoi usarla su più dispositivi colleghi il tuo Google Drive, ma è facoltativo.'
		},
		{
			question: 'Dove finiscono i miei dati?',
			answer:
				'Sul tuo dispositivo, nel database del browser. Se attivi la sincronizzazione, anche in un foglio Google nel tuo Drive. Listo non ha un server e non raccoglie dati.'
		},
		{
			question: 'Funziona senza connessione?',
			answer:
				'Sì. Una volta aperta, l’app funziona anche offline: puoi consultare e modificare le liste, e le modifiche si sincronizzano quando torna la rete.'
		},
		{
			question: 'Posso usarla su telefono e computer insieme?',
			answer:
				'Sì, collegando lo stesso account Google su entrambi: le liste restano allineate tramite un foglio nel tuo Drive.'
		},
		{
			question: 'Posso usarla anche per cose che non sono cibo?',
			answer:
				'Certo: le categorie e i campi li decidi tu. Ci sono modelli per medicinali, garage e magazzino, ufficio, libri e cose da fare, oppure parti da zero.'
		},
		{
			question: 'Come si installa sul telefono?',
			answer:
				'Con il pulsante «Installa l’app» in questa pagina, oppure dal menu del browser con «Installa app» (Android) o «Aggiungi alla schermata Home» (iPhone, da Safari).'
		}
	];

	const btn = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-medium';
</script>

<Seo
	title="Listo: inventario di congelatore e dispensa, gratis"
	description="Tieni l'inventario di congelatore, dispensa e lista della spesa con categorie multiple per ogni elemento. Gratis, senza account, funziona anche offline."
	jsonLd={[webApplication(), faqPage(faqs)]}
/>

<!-- eslint-disable svelte/no-navigation-without-resolve -- use-case paths are listed in $lib/seo/pages -->
<main>
	<!-- Hero -->
	<section class="mx-auto grid max-w-5xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:py-20">
		<div>
			<p class="text-sm font-semibold tracking-wide text-muted uppercase">
				Liste con categorie multiple
			</p>
			<h1 class="mt-3 text-4xl leading-tight font-bold sm:text-5xl">
				L'inventario di congelatore e dispensa, sempre in tasca
			</h1>
			<p class="mt-5 text-lg text-muted">
				Listo è un'app gratuita per liste personalizzabili in cui ogni elemento può stare in più
				categorie. Sai cosa hai in casa anche quando sei al supermercato.
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<a href={resolve('/app')} class="{btn} bg-primary text-on-primary">Apri Listo</a>
				<InstallButton class="{btn} border border-line bg-surface" />
			</div>
			<ul class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
				<li class="flex items-center gap-1.5"><Icon name="check" size={16} /> Gratis</li>
				<li class="flex items-center gap-1.5"><Icon name="check" size={16} /> Senza account</li>
				<li class="flex items-center gap-1.5"><Icon name="check" size={16} /> Funziona offline</li>
			</ul>
		</div>
		<AppPreview
			title="Congelatore"
			filters={[
				{ emoji: '🥦', name: 'Verdura', color: 'verde', on: true },
				{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio', on: true },
				{ emoji: '🥩', name: 'Carne', color: 'rosso' }
			]}
			items={[
				{
					name: 'Minestrone',
					detail: '3 porzioni · 12 giorni fa',
					categories: [
						{ emoji: '🥦', name: 'Verdura', color: 'verde' },
						{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio' }
					]
				},
				{
					name: 'Lasagne',
					detail: '1 teglia · 5 giorni fa',
					categories: [{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio' }]
				},
				{
					name: 'Piselli',
					detail: '2 sacchetti · 2 mesi fa',
					categories: [{ emoji: '🥦', name: 'Verdura', color: 'verde' }]
				},
				{
					name: 'Spinaci',
					detail: '500 g · 3 settimane fa',
					categories: [{ emoji: '🥦', name: 'Verdura', color: 'verde' }]
				}
			]}
		/>
	</section>

	<!-- The problem -->
	<section class="border-y border-line bg-surface">
		<div class="mx-auto max-w-3xl px-4 py-14 text-center">
			<h2 class="text-2xl font-bold sm:text-3xl">
				Il minestrone va tra le verdure o tra i piatti pronti?
			</h2>
			<p class="mt-4 text-lg text-muted">
				Nelle note e nelle app di liste ogni cosa sta in un solo posto, e prima o poi non la trovi
				più. In Listo un elemento ha tutte le categorie che vuoi: cerchi «Piatti pronti» per la cena
				di stasera, «Verdura» per il contorno, e il minestrone compare in entrambi.
			</p>
		</div>
	</section>

	<!-- Features -->
	<section class="mx-auto max-w-5xl px-4 py-16">
		<h2 class="text-center text-2xl font-bold sm:text-3xl">Cosa sa fare Listo</h2>
		<ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature.title)}
				<li class="rounded-2xl border border-line bg-surface p-6">
					<span class="grid size-11 place-items-center rounded-xl bg-bg text-accent">
						<Icon name={feature.icon} size={22} />
					</span>
					<h3 class="mt-4 font-semibold">{feature.title}</h3>
					<p class="mt-2 text-muted">{feature.text}</p>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Use cases: internal links to the dedicated pages -->
	<section class="mx-auto max-w-5xl px-4 py-8">
		<h2 class="text-center text-2xl font-bold sm:text-3xl">Una lista per ogni angolo di casa</h2>
		<p class="mx-auto mt-3 max-w-2xl text-center text-muted">
			Parti da un modello già pronto e cambialo come vuoi, oppure crea le tue categorie da zero.
		</p>
		<ul class="mt-10 grid gap-6 md:grid-cols-3">
			{#each useCases as useCase (useCase.path)}
				<li>
					<a
						href={useCase.path}
						class="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 hover:border-ink/40"
					>
						<span class="text-accent"><Icon name={useCase.icon} size={28} /></span>
						<h3 class="mt-4 text-lg font-semibold">{useCase.title}</h3>
						<p class="mt-2 flex-1 text-muted">{useCase.text}</p>
						<span class="mt-4 flex items-center gap-1 text-sm font-medium"
							>Scopri come <Icon name="chevron" size={16} /></span
						>
					</a>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Not only food: the engine is generic -->
	<section class="mx-auto max-w-5xl px-4 py-12">
		<h2 class="text-center text-2xl font-bold sm:text-3xl">Non solo cucina</h2>
		<p class="mx-auto mt-3 max-w-2xl text-center text-muted">
			Categorie e campi li decidi tu, quindi Listo va bene per qualsiasi cosa tu voglia tenere in
			ordine. Qualche modello per cominciare:
		</p>
		<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each otherTemplates as template (template.id)}
				<li class="flex gap-4 rounded-2xl border border-line bg-surface p-5">
					<span class="grid size-11 shrink-0 place-items-center rounded-xl bg-bg text-accent">
						<Icon name={template.icon} size={22} />
					</span>
					<span>
						<h3 class="font-semibold">{template.name}</h3>
						<p class="mt-1 text-sm text-muted">{template.description}</p>
						{#if template.fields.length}
							<p class="mt-2 text-xs text-muted">
								Campi: {template.fields.map((f) => f.name).join(', ')}
							</p>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- How it works -->
	<section class="mx-auto max-w-5xl px-4 py-16">
		<h2 class="text-center text-2xl font-bold sm:text-3xl">Come funziona</h2>
		<ol class="mt-10 grid gap-6 md:grid-cols-3">
			{#each [['Crea una lista', 'Scegli un modello (congelatore, dispensa, spesa) o parti da zero, e sistema le categorie.'], ['Aggiungi le cose', 'Scrivi il nome e invio. Poi, se vuoi, quantità, categorie, data e una nota.'], ['Consultala ovunque', 'A casa o al supermercato filtri per categoria e vedi subito cosa hai e da quanto.']] as [title, text], i (title)}
				<li class="rounded-2xl border border-line p-6">
					<span
						class="grid size-9 place-items-center rounded-full bg-primary font-bold text-on-primary"
						>{i + 1}</span
					>
					<h3 class="mt-4 font-semibold">{title}</h3>
					<p class="mt-2 text-muted">{text}</p>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Privacy -->
	<section class="border-y border-line bg-surface">
		<div class="mx-auto flex max-w-3xl flex-col items-center px-4 py-14 text-center">
			<span class="text-accent"><Icon name="shield" size={32} /></span>
			<h2 class="mt-4 text-2xl font-bold sm:text-3xl">I tuoi dati restano tuoi</h2>
			<p class="mt-4 text-lg text-muted">
				Listo non ha un server: le liste stanno sul tuo dispositivo e, se vuoi, nel tuo Google
				Drive. Nessun account, nessuna pubblicità, nessun tracciamento.
			</p>
			<a class="mt-4 underline" href={resolve('/(sito)/privacy')}>Leggi come funziona</a>
		</div>
	</section>

	<FaqList {faqs} />

	<!-- Final call to action -->
	<section class="mx-auto max-w-3xl px-4 py-8 text-center">
		<h2 class="text-2xl font-bold sm:text-3xl">Prova Listo adesso</h2>
		<p class="mt-3 text-muted">
			Si apre nel browser, senza registrazione. Poi, se ti piace, la installi.
		</p>
		<div class="mt-6 flex flex-wrap justify-center gap-3">
			<a href={resolve('/app')} class="{btn} bg-primary text-on-primary">Apri Listo</a>
			<InstallButton class="{btn} border border-line bg-surface" />
		</div>
	</section>
</main>
