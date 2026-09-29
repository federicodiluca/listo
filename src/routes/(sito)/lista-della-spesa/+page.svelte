<script lang="ts">
	import type { Faq } from '$lib/seo/jsonld';
	import UseCase from '$lib/site-ui/UseCase.svelte';

	const faqs: Faq[] = [
		{
			question: 'Posso ordinare la lista della spesa per reparto?',
			answer:
				'Sì: ordina la lista «per categoria» e gli elementi si raggruppano per reparto, nell’ordine che hai deciso tu, così la segui mentre giri tra gli scaffali.'
		},
		{
			question: 'Come tolgo le cose che ho già comprato?',
			answer:
				'Archiviale: spariscono dalla lista ma restano disponibili. La prossima volta che scrivi il nome, Listo te le ripropone con le stesse categorie.'
		},
		{
			question: 'La lista funziona anche nel supermercato senza campo?',
			answer:
				'Sì. Una volta aperta almeno una volta, l’app funziona anche offline, e le modifiche si sincronizzano quando torna la rete.'
		}
	];
</script>

<UseCase
	path="/lista-della-spesa"
	label="Lista della spesa"
	title="Lista della spesa per reparto, con categorie | Listo"
	description="Una lista della spesa divisa per reparto, con categorie multiple e le cose che ricompri sempre a portata di tocco. Gratis, senza account, funziona offline."
	heading="La lista della spesa, divisa per reparto"
	intro="Con Listo la lista della spesa segue il tuo giro al supermercato: raggruppata per reparto, con le cose urgenti in evidenza e quelle che compri sempre pronte da ripescare."
	template="spesa"
	{faqs}
>
	<h2>Perché le categorie multiple servono anche qui</h2>
	<p>
		Il latte è nel reparto latticini, ma è anche «Urgente» perché è finito stamattina. Con Listo un
		elemento può avere entrambe le categorie: lo vedi nel suo reparto quando fai il giro, e tra le
		urgenze quando passi al volo solo per l'essenziale.
	</p>

	<h2>Le cose che compri sempre</h2>
	<p>
		Una lista della spesa si svuota e si riempie di continuo, quasi sempre con le stesse cose.
		Quando compri qualcosa archivialo: la settimana dopo, appena inizi a scriverne il nome, Listo te
		lo ripropone con le sue categorie. Niente da riscrivere da capo.
	</p>

	<h2>Come usarla</h2>
	<ul>
		<li>
			Parti dal modello Lista della spesa e metti le categorie nell'ordine dei reparti del tuo
			supermercato.
		</li>
		<li>Ordina «per categoria»: la lista si divide in gruppi, un reparto dopo l'altro.</li>
		<li>Aggiungi «Urgente» alle cose che non puoi dimenticare.</li>
		<li>
			Tienila accanto alla lista del congelatore e della dispensa: prima di uscire controlli cosa
			hai già, poi compri solo il resto.
		</li>
	</ul>
</UseCase>
