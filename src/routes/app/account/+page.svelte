<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatRelativeTime } from '$lib/data/dates';
	import { prepareAuth } from '$lib/google/auth';
	import { isGoogleConfigured } from '$lib/google/config';
	import { site } from '$lib/site';
	import { sync } from '$lib/sync/sync.svelte';
	import AppHeader from '$lib/ui/AppHeader.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import { onMount } from 'svelte';

	// Load Google's script now, so that the popup can open right away on tap
	onMount(() => {
		if (isGoogleConfigured) prepareAuth().catch(() => {});
	});

	// Re-render the "5 minuti fa" text every half minute
	let now = $state(new Date());
	onMount(() => {
		const timer = setInterval(() => (now = new Date()), 30_000);
		return () => clearInterval(timer);
	});

	const statusText = $derived.by(() => {
		switch (sync.status) {
			case 'syncing':
				return 'Sincronizzazione in corso…';
			case 'offline':
				return 'Sei offline: sincronizzerò appena torna la rete.';
			case 'needs-auth':
				return "L'accesso a Google è scaduto: tocca «Sincronizza ora» per rinnovarlo.";
			case 'error':
				return 'Ultima sincronizzazione non riuscita.';
			default:
				return sync.pending ? 'Ci sono modifiche da sincronizzare.' : 'Tutto sincronizzato.';
		}
	});

	async function disconnect() {
		if (
			confirm(
				'Scollegare Google Drive? Le liste restano su questo dispositivo e il foglio resta nel tuo Drive.'
			)
		) {
			await sync.disconnect();
		}
	}

	const button =
		'flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium disabled:opacity-40';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- external links (Google Sheets, author site) -->
<svelte:head>
	<title>Account e sincronizzazione — Listo</title>
</svelte:head>

<AppHeader title="Account e sincronizzazione" back={resolve('/app')} />

<main class="mx-auto flex max-w-xl flex-col gap-8 px-4 py-6">
	<section>
		<h2 class="text-lg font-semibold">Sincronizzazione con Google Drive</h2>

		{#if !isGoogleConfigured}
			<p class="mt-2 text-muted">
				La sincronizzazione non è disponibile in questa installazione di Listo.
			</p>
		{:else if !sync.enabled}
			<p class="mt-2 text-muted">
				Senza collegamento le tue liste restano solo su questo dispositivo. Collegando Google Drive:
			</p>
			<ul class="mt-4 flex flex-col gap-3">
				<li class="flex gap-3">
					<span class="text-accent"><Icon name="check" /></span>
					<span>ritrovi le stesse liste su telefono e computer;</span>
				</li>
				<li class="flex gap-3">
					<span class="text-accent"><Icon name="check" /></span>
					<span>hai sempre una copia di sicurezza, in un foglio Google nel tuo Drive;</span>
				</li>
				<li class="flex gap-3">
					<span class="text-accent"><Icon name="check" /></span>
					<span
						>Listo vede <strong>solo i file che crea</strong>, non il resto del tuo Drive, e i dati
						non passano da nessun server di Listo.</span
					>
				</li>
			</ul>
			<button
				class="{button} mt-6 w-full bg-primary text-on-primary"
				onclick={() => sync.connect()}
			>
				<Icon name="cloud" /> Collega Google Drive
			</button>
			<p class="mt-3 text-sm text-muted">
				Si aprirà una finestra di Google: scegli il tuo account e consenti l'accesso ai file creati
				da Listo. Puoi scollegarti quando vuoi.
			</p>
		{:else}
			<div class="mt-4 rounded-2xl border border-line bg-surface p-4">
				<p class="flex items-center gap-2 font-medium">
					<span class="text-muted"
						><Icon name={sync.status === 'offline' ? 'cloudOff' : 'cloud'} /></span
					>
					{statusText}
				</p>
				{#if sync.lastSyncedAt}
					<p class="mt-1 text-sm text-muted">
						Ultima sincronizzazione: {formatRelativeTime(sync.lastSyncedAt, now)}
					</p>
				{/if}
				{#if sync.error}<p class="mt-2 text-sm text-danger" role="alert">{sync.error}</p>{/if}
			</div>

			<div class="mt-4 flex flex-col gap-3">
				<button
					class="{button} bg-primary text-on-primary"
					disabled={sync.status === 'syncing'}
					onclick={() => sync.syncNow()}
				>
					<Icon name="refresh" /> Sincronizza ora
				</button>
				{#if sync.fileUrl}
					<a
						class="{button} border border-line"
						href={sync.fileUrl}
						target="_blank"
						rel="noreferrer"
					>
						<Icon name="external" /> Apri il foglio in Google Fogli
					</a>
				{/if}
				<button class="{button} text-danger" onclick={disconnect}>Scollega Google Drive</button>
			</div>
		{/if}
	</section>

	<section class="border-t border-line pt-6 text-sm text-muted">
		<p>
			Listo è un progetto di
			<a class="underline" href={site.author.url}>{site.author.name}</a>. Contatti:
			<a class="underline" href="mailto:{site.contactEmail}">{site.contactEmail}</a>.
		</p>
	</section>
</main>
