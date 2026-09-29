<script lang="ts">
	import type { Faq } from '$lib/seo/jsonld';
	import UseCase from '$lib/site-ui/UseCase.svelte';

	const faqs: Faq[] = [
		{
			question: 'Posso segnare la data in cui ho congelato un alimento?',
			answer:
				'Sì. Ogni elemento ha la sua data di aggiunta, che puoi correggere a mano se lo inserisci qualche giorno dopo. L’app ti mostra da quanto tempo è in freezer.'
		},
		{
			question: 'Come vedo prima le cose congelate da più tempo?',
			answer:
				'Ordina la lista per data di aggiunta, «prima i più vecchi»: è anche l’ordine predefinito del modello Congelatore.'
		},
		{
			question: 'Cosa succede quando finisco un alimento?',
			answer:
				'Lo archivi. Non sparisce: la prossima volta che lo scrivi nella barra di aggiunta, Listo te lo propone con le stesse categorie e unità.'
		}
	];
</script>

<UseCase
	path="/congelatore"
	label="Congelatore"
	title="Inventario del congelatore: l'app gratuita | Listo"
	description="Sai sempre cosa c'è nel congelatore e da quando: inventario del freezer con categorie multiple, date e quantità. Gratis, senza account, anche offline."
	heading="L'inventario del congelatore, senza aprire lo sportello"
	intro="Con Listo sai cosa c'è nel freezer, quanto ne resta e da quanto tempo è lì. Lo consulti dal telefono anche al supermercato, così non ricompri quello che hai già."
	template="congelatore"
	{faqs}
>
	<h2>Perché tenere l'inventario del freezer</h2>
	<p>
		Il congelatore è il posto dove le cose si perdono: sacchetti in fondo ai cassetti, porzioni
		senza etichetta, il pane dimenticato da mesi. Un inventario ti evita di comprare doppio, ti
		ricorda cosa consumare prima e ti fa organizzare i pasti partendo da quello che hai.
	</p>

	<h2>Un alimento, più categorie</h2>
	<p>
		Nelle liste normali ogni cosa sta in un solo gruppo. Ma il minestrone fatto in casa è sia
		verdura sia un piatto pronto, e il ragù è sia carne sia un sugo. In Listo ogni elemento può
		avere tutte le categorie che vuoi: filtri per «Piatti pronti» quando cerchi la cena di stasera,
		per «Verdura» quando ti serve un contorno, e lo trovi in entrambi i casi.
	</p>

	<h2>Come usarlo, in pratica</h2>
	<ul>
		<li>
			Quando metti qualcosa in freezer, scrivilo subito nella barra in basso: basta il nome, il
			resto lo aggiungi dopo.
		</li>
		<li>
			Indica quantità e unità («3 porzioni», «500 g», «2 sacchetti») e togline quando ne usi una
			parte.
		</li>
		<li>
			Se lo segni con qualche giorno di ritardo, correggi la data: conta quando è stato congelato,
			non quando l'hai scritto.
		</li>
		<li>
			Ordina «prima i più vecchi» e consuma dall'alto: è il modo più semplice per non buttare
			niente.
		</li>
		<li>
			Per i tempi di conservazione affidati sempre all'etichetta e alle indicazioni del produttore:
			nella nota di ogni elemento puoi segnarti una scadenza o un promemoria.
		</li>
	</ul>

	<h2>Al supermercato</h2>
	<p>
		È il momento in cui l'inventario serve davvero. Apri Listo, filtri per categoria e in un secondo
		vedi se hai ancora i piselli o se il pesce è finito. L'app si apre anche con poco segnale,
		perché i dati sono già sul telefono.
	</p>
</UseCase>
