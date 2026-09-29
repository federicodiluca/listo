<script lang="ts">
	import { breadcrumbs } from '$lib/seo/jsonld';
	import Seo from '$lib/seo/Seo.svelte';
	import { site } from '$lib/site';
</script>

<Seo
	title="Privacy | Listo"
	description="Come Listo tratta i tuoi dati: niente server, niente account, niente tracciamento. Le liste restano sul tuo dispositivo e, se vuoi, nel tuo Google Drive."
	jsonLd={[breadcrumbs('Privacy', '/privacy')]}
/>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external links -->
<main
	class="mx-auto max-w-3xl px-4 py-10 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_li]:mt-2 [&_p]:mt-3 [&_p]:text-muted [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted"
>
	<h1 class="text-3xl font-bold sm:text-4xl">Privacy</h1>
	<p>Ultimo aggiornamento: 29 settembre 2026.</p>

	<p class="text-lg">
		In breve: Listo non ha un server e non raccoglie dati. Le tue liste stanno sul tuo dispositivo
		e, solo se lo scegli tu, in un file nel tuo Google Drive.
	</p>

	<h2>Chi c'è dietro</h2>
	<p>
		Listo è un progetto personale di
		<a class="underline" href={site.author.url}>{site.author.name}</a>. Per qualsiasi domanda:
		<a class="underline" href="mailto:{site.contactEmail}">{site.contactEmail}</a>.
	</p>

	<h2>Dati salvati sul tuo dispositivo</h2>
	<p>L'app salva nel browser, e solo lì:</p>
	<ul>
		<li>le tue liste, categorie ed elementi (nel database del browser, IndexedDB);</li>
		<li>
			alcune preferenze: l'ultima lista aperta e lo stato della sincronizzazione (nel
			<em>localStorage</em>);
		</li>
		<li>i file dell'app stessa, per poterla aprire anche offline.</li>
	</ul>
	<p>
		Questi dati non vengono inviati a nessuno. Puoi cancellarli in qualsiasi momento eliminando i
		dati del sito dalle impostazioni del browser.
	</p>

	<h2>Sincronizzazione con Google Drive (facoltativa)</h2>
	<p>
		Se colleghi Google Drive, l'app accede al tuo account tramite il servizio di accesso di Google e
		chiede un solo permesso, <strong>«file di Google Drive creati da questa app»</strong>: vede
		esclusivamente il foglio «Listo» che crea lei, non il resto del tuo Drive.
	</p>
	<ul>
		<li>
			I dati viaggiano direttamente tra il tuo browser e Google: non passano da server di Listo,
			perché non esistono.
		</li>
		<li>
			Il permesso di accesso dura circa un'ora ed è conservato solo nel tuo browser; poi va
			rinnovato con un tocco.
		</li>
		<li>
			Puoi scollegarti dalla pagina «Account e sincronizzazione» dell'app, oppure revocare l'accesso
			dalle
			<a class="underline" href="https://myaccount.google.com/permissions"
				>impostazioni del tuo account Google</a
			>. Il foglio resta nel tuo Drive finché non lo elimini tu.
		</li>
	</ul>
	<p>
		Per l'accesso e per Google Drive si applica l'<a
			class="underline"
			href="https://policies.google.com/privacy">informativa privacy di Google</a
		>.
	</p>

	<h2>Cosa Listo non fa</h2>
	<ul>
		<li>Non chiede di creare un account.</li>
		<li>Non usa cookie propri, strumenti di statistica o di tracciamento.</li>
		<li>Non mostra pubblicità e non vende o condivide dati.</li>
	</ul>

	<h2>Hosting</h2>
	<p>
		Il sito è pubblicato con GitHub Pages. Come ogni server web, GitHub può registrare dati tecnici
		delle richieste (per esempio l'indirizzo IP) per motivi di sicurezza: vedi l'<a
			class="underline"
			href="https://docs.github.com/it/site-policy/privacy-policies/github-general-privacy-statement"
			>informativa privacy di GitHub</a
		>.
	</p>

	<h2>Codice aperto</h2>
	<p>
		Il codice di Listo è pubblico su
		<a class="underline" href="https://github.com/federicodiluca/listo">GitHub</a>: chiunque può
		verificare che fa quello che è scritto qui.
	</p>
</main>
