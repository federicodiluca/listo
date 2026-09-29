<script lang="ts">
	import { installer } from '$lib/install.svelte';
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';

	let { class: className = '' }: { class?: string } = $props();

	const id = $props.id();
	// inside {#if}: the element comes and goes, so the reference must be reactive
	let sheet = $state<HTMLElement>();
	// Hidden until the browser has told us whether the app is already installed,
	// so prerendered pages don't flash a button that then disappears
	let ready = $state(false);
	onMount(() => (ready = true));

	async function install() {
		if (installer.canPrompt) await installer.prompt();
		else sheet?.showPopover();
	}
</script>

{#if ready && !installer.installed}
	<button type="button" class={className} onclick={install}>
		<Icon name="download" />
		Installa l'app
	</button>

	<div popover id="{id}-install" class="sheet" bind:this={sheet}>
		<h2 class="text-lg font-semibold">Installa Listo</h2>
		<p class="mt-1 text-sm text-muted">
			Avrai l'icona sulla schermata Home e l'app si aprirà a tutto schermo, anche senza rete.
		</p>
		<ol class="mt-4 flex list-decimal flex-col gap-3 pl-5">
			{#if installer.platform === 'ios'}
				<li>Apri questa pagina con <strong>Safari</strong>.</li>
				<li>
					Tocca il pulsante <strong>Condividi</strong> (il quadrato con la freccia verso l'alto).
				</li>
				<li>
					Scorri e scegli <strong>Aggiungi alla schermata Home</strong>, poi
					<strong>Aggiungi</strong>.
				</li>
			{:else if installer.platform === 'android'}
				<li>Apri il menu del browser (i tre puntini in alto a destra).</li>
				<li>
					Scegli <strong>Installa app</strong> oppure <strong>Aggiungi a schermata Home</strong>.
				</li>
				<li>Conferma: l'icona di Listo comparirà tra le tue app.</li>
			{:else}
				<li>Apri la pagina con <strong>Chrome</strong> o <strong>Edge</strong>.</li>
				<li>
					Clicca l'icona di installazione nella barra degli indirizzi, oppure apri il menu e scegli
					<strong>Installa Listo</strong>.
				</li>
				<li>Sul telefono è ancora più comodo: apri questa pagina da lì.</li>
			{/if}
		</ol>
		<button
			type="button"
			class="mt-6 w-full rounded-xl border border-line py-3"
			onclick={() => sheet?.hidePopover()}>Ho capito</button
		>
	</div>
{/if}
