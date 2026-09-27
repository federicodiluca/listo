<!--
	Throwaway spike: checks that the Google Drive/Sheets approach works from an
	Android phone before we build the app on it. To be deleted once validated.
-->
<script lang="ts">
	import { requestAccessToken, revokeAccessToken, type AccessToken } from '$lib/google/auth';
	import { isGoogleConfigured } from '$lib/google/config';
	import { listSpreadsheets } from '$lib/google/drive';
	import { rowsToRecords } from '$lib/google/rows';
	import {
		appendRows,
		createSpreadsheet,
		getSpreadsheet,
		readRows,
		type Spreadsheet
	} from '$lib/google/sheets';
	import { onMount } from 'svelte';

	const button = 'rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40';
	const STORAGE_KEY = 'listo:prototipo:spreadsheet';
	const HEADER = ['id', 'nome', 'quantita', 'unita', 'categorie', 'data_aggiunta', 'nota'];

	let token = $state<AccessToken>();
	let sheet = $state<Spreadsheet>();
	let found = $state<Spreadsheet[]>([]);
	let records = $state<Record<string, string>[]>([]);
	let itemName = $state('Minestrone');
	let busy = $state(false);
	let log = $state<string[]>([]);
	let now = $state(Date.now());

	let minutesLeft = $derived(token ? Math.max(0, Math.round((token.expiresAt - now) / 60000)) : 0);

	onMount(() => {
		const timer = setInterval(() => (now = Date.now()), 10_000);
		return () => clearInterval(timer);
	});

	function write(message: string) {
		const time = new Date().toLocaleTimeString('it-IT');
		log = [`${time} — ${message}`, ...log];
	}

	function rememberSheet(id: string) {
		try {
			localStorage.setItem(STORAGE_KEY, id);
		} catch {
			// storage unavailable (private mode): the spike works anyway, it just forgets
		}
	}

	function savedSheetId(): string | null {
		try {
			return localStorage.getItem(STORAGE_KEY);
		} catch {
			return null;
		}
	}

	/** Runs an action, disabling the buttons and logging duration or error. */
	async function run(label: string, action: () => Promise<void>) {
		busy = true;
		const start = performance.now();
		try {
			await action();
			write(`${label}: ok (${Math.round(performance.now() - start)} ms)`);
		} catch (error) {
			write(`${label}: ERRORE — ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			busy = false;
		}
	}

	const login = (mode: 'consent' | 'silent') =>
		run(mode === 'consent' ? 'Accesso' : 'Rinnovo silenzioso', async () => {
			token = await requestAccessToken(mode);
			const saved = savedSheetId();
			if (saved && !sheet) sheet = await getSpreadsheet(token, saved);
		});

	const logout = () =>
		run('Disconnessione', async () => {
			if (token) await revokeAccessToken(token);
			token = undefined;
		});

	const create = () =>
		run('Creazione foglio', async () => {
			if (!token) return;
			sheet = await createSpreadsheet(token, 'Listo — prova', ['categorie', 'elementi']);
			await appendRows(token, sheet.id, 'elementi', [HEADER]);
			rememberSheet(sheet.id);
			records = [];
		});

	const find = () =>
		run('Ricerca fogli su Drive', async () => {
			if (!token) return;
			found = await listSpreadsheets(token);
			write(`Trovati ${found.length} fogli`);
		});

	const use = (chosen: Spreadsheet) =>
		run(`Apertura di "${chosen.title}"`, async () => {
			if (!token) return;
			sheet = chosen;
			rememberSheet(chosen.id);
			records = rowsToRecords(await readRows(token, chosen.id, 'elementi'));
		});

	const add = () =>
		run('Aggiunta riga', async () => {
			if (!token || !sheet) return;
			const today = new Date().toISOString().slice(0, 10);
			const row = [crypto.randomUUID(), itemName, '1', 'porzioni', '', today, ''];
			await appendRows(token, sheet.id, 'elementi', [row]);
		});

	const read = () =>
		run('Lettura righe', async () => {
			if (!token || !sheet) return;
			records = rowsToRecords(await readRows(token, sheet.id, 'elementi'));
		});
</script>

<svelte:head>
	<title>Prototipo Google Fogli — Listo</title>
</svelte:head>

<main class="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
	<header>
		<h1 class="text-2xl font-bold">Prototipo Google Fogli</h1>
		<p class="mt-1 text-sm opacity-70">
			Verifica accesso, creazione, scrittura, lettura e ricerca dei fogli creati da Listo.
		</p>
	</header>

	{#if !isGoogleConfigured}
		<p class="rounded-lg bg-amber-100 p-4 text-amber-900">
			Mancano le credenziali Google: copia <code>.env.example</code> in <code>.env</code> e compilalo.
		</p>
	{:else}
		<section class="flex flex-col gap-2">
			<h2 class="font-semibold">1. Accesso</h2>
			{#if token}
				<p class="text-sm">Token valido ancora per circa {minutesLeft} minuti.</p>
			{/if}
			<div class="flex flex-wrap gap-2">
				<button class={button} disabled={busy} onclick={() => login('consent')}>
					Accedi con Google
				</button>
				<button class={button} disabled={busy || !token} onclick={() => login('silent')}>
					Rinnova in silenzio
				</button>
				<button class={button} disabled={busy || !token} onclick={logout}>Esci</button>
			</div>
		</section>

		<section class="flex flex-col gap-2">
			<h2 class="font-semibold">2. Foglio</h2>
			{#if sheet}
				<p class="text-sm">
					In uso:
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link to Google Sheets -->
					<a class="underline" href={sheet.url} target="_blank" rel="noreferrer">{sheet.title}</a>
				</p>
			{/if}
			<div class="flex flex-wrap gap-2">
				<button class={button} disabled={busy || !token} onclick={create}
					>Crea foglio di prova</button
				>
				<button class={button} disabled={busy || !token} onclick={find}>Trova i miei fogli</button>
			</div>
			{#if found.length}
				<ul class="divide-y rounded-lg border text-sm">
					{#each found as candidate (candidate.id)}
						<li class="flex items-center justify-between gap-2 px-3 py-2">
							<span class="truncate">{candidate.title}</span>
							<button
								class="rounded-lg border px-3 py-1 disabled:opacity-40"
								disabled={busy || candidate.id === sheet?.id}
								onclick={() => use(candidate)}>Usa</button
							>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="flex flex-col gap-2">
			<h2 class="font-semibold">3. Righe</h2>
			<div class="flex flex-wrap gap-2">
				<input
					class="min-w-0 flex-1 rounded-lg border px-3 py-2"
					bind:value={itemName}
					aria-label="Nome elemento"
				/>
				<button class={button} disabled={busy || !sheet} onclick={add}>Aggiungi</button>
				<button class={button} disabled={busy || !sheet} onclick={read}>Leggi</button>
			</div>
			{#if records.length}
				<ul class="divide-y rounded-lg border text-sm">
					{#each records as record (record.id)}
						<li class="px-3 py-2">
							{record.nome} — {record.quantita}
							{record.unita} — {record.data_aggiunta}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}

	<section class="flex flex-col gap-2">
		<h2 class="font-semibold">Registro</h2>
		<ol class="rounded-lg bg-neutral-100 p-3 font-mono text-xs">
			{#each log as entry, i (i)}
				<li>{entry}</li>
			{:else}
				<li class="opacity-60">Nessuna operazione.</li>
			{/each}
		</ol>
	</section>
</main>
