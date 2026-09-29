<script lang="ts">
	import type { Faq } from '$lib/seo/jsonld';
	import UseCase from '$lib/site-ui/UseCase.svelte';

	const faqs: Faq[] = [
		{
			question: 'Posso tenere dispensa e congelatore in liste separate?',
			answer:
				'Sì, puoi creare tutte le liste che vuoi, ognuna con le sue categorie. Le cambi con un tocco dal nome in alto.'
		},
		{
			question: 'Come vedo cosa sta finendo?',
			answer:
				'Ordina la lista per quantità, «prima i meno»: in cima trovi quello che sta per esaurirsi. Gli elementi senza quantità restano in fondo.'
		},
		{
			question: 'Posso raggruppare la dispensa per scaffale o per tipo?',
			answer:
				'Sì: le categorie le decidi tu. Puoi usarle per tipo di alimento, per scaffale o per entrambe le cose, visto che un elemento può averne più di una.'
		}
	];
</script>

<UseCase
	path="/dispensa"
	label="Dispensa"
	title="App per la dispensa: gestisci le scorte di casa | Listo"
	description="Tieni sotto controllo le scorte della dispensa: pasta, conserve, legumi e condimenti con quantità e categorie multiple. App gratuita, senza account."
	heading="Le scorte della dispensa, sotto controllo"
	intro="Pasta, riso, conserve, legumi, condimenti: con Listo vedi cosa hai in dispensa e cosa sta finendo, e lo controlli dal telefono prima di fare la spesa."
	template="dispensa"
	{faqs}
>
	<h2>Perché una lista per la dispensa</h2>
	<p>
		In dispensa si accumulano doppioni: tre pacchi di lenticchie aperti, il barattolo di pelati
		comprato «per sicurezza». Una lista delle scorte ti dice cosa hai davvero, così compri solo
		quello che manca e usi quello che hai prima che scada.
	</p>

	<h2>Categorie che si sovrappongono</h2>
	<p>
		Il sugo pronto è una conserva ma anche un condimento. I cracker sono uno snack ma anche «per la
		colazione». Con Listo non devi scegliere: ogni elemento può stare in più categorie, e lo ritrovi
		da qualunque parte lo cerchi. Puoi anche usare categorie per posizione, come «Scaffale alto» o
		«Cantina», insieme a quelle per tipo.
	</p>

	<h2>Come organizzarla</h2>
	<ul>
		<li>Parti dal modello Dispensa e rinomina le categorie come le chiami tu.</li>
		<li>
			Segna la quantità solo dove ti serve: «2 pacchi», «1 barattolo». Per le spezie può bastare il
			nome.
		</li>
		<li>Ordina per quantità, «prima i meno», per vedere subito cosa ricomprare.</li>
		<li>
			Quando un prodotto finisce archivialo: alla prossima spesa lo ripeschi con un tocco, con le
			sue categorie già pronte.
		</li>
		<li>Usa la nota per la scadenza o per ricordarti la marca che preferisci.</li>
	</ul>
</UseCase>
