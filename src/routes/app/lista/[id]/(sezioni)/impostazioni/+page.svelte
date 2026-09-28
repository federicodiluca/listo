<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getListContext } from '$lib/data/list-context';
	import { deleteList, renameList } from '$lib/data/lists';
	import { getLastListId, setLastListId } from '$lib/prefs';
	import { sync } from '$lib/sync/sync.svelte';
	import Icon from '$lib/ui/Icon.svelte';

	const context = getListContext();
	const list = $derived(context.summary.list);
	const active = $derived(context.items.filter((i) => !i.archivedAt).length);
	const archived = $derived(context.items.length - active);

	// Follows the stored name (e.g. after switching list) but can be edited in the field
	let name = $derived(list.name);
	let saved = $state(false);

	async function rename(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim() || name.trim() === list.name) return;
		await renameList(list.id, name);
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	async function remove() {
		const total = context.items.length;
		const detail = total ? ` e i suoi ${total} elementi` : '';
		if (!confirm(`Eliminare «${list.name}»${detail}? Non si può annullare.`)) return;
		await deleteList(list.id);
		if (getLastListId() === list.id) setLastListId(null);
		await goto(resolve('/app/liste'), { replaceState: true });
	}

	const created = $derived(
		new Date(list.createdAt).toLocaleDateString('it-IT', { dateStyle: 'long' })
	);
</script>

<svelte:head>
	<title>Impostazioni · {list.name} — Listo</title>
</svelte:head>

<main class="mx-auto flex max-w-xl flex-col gap-8 px-4 py-6">
	<section>
		<h2 class="font-semibold"><label for="list-name">Nome della lista</label></h2>
		<form class="mt-2 flex gap-2" onsubmit={rename}>
			<input
				id="list-name"
				class="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5"
				bind:value={name}
				enterkeyhint="done"
			/>
			<button
				class="rounded-xl bg-primary px-4 text-on-primary disabled:opacity-40"
				disabled={!name.trim() || name.trim() === list.name}>Salva</button
			>
		</form>
		{#if saved}<p class="mt-2 text-sm text-muted" role="status">Nome salvato.</p>{/if}
	</section>

	<section>
		<h2 class="font-semibold">Informazioni</h2>
		<dl class="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface text-sm">
			<div class="flex justify-between px-4 py-3">
				<dt class="text-muted">Elementi</dt>
				<dd>{active}</dd>
			</div>
			<div class="flex justify-between px-4 py-3">
				<dt class="text-muted">Archiviati</dt>
				<dd>{archived}</dd>
			</div>
			<div class="flex justify-between px-4 py-3">
				<dt class="text-muted">Creata il</dt>
				<dd>{created}</dd>
			</div>
		</dl>
		<p class="mt-2 text-sm text-muted">
			{sync.enabled
				? 'Le liste sono sincronizzate con il tuo Google Drive.'
				: 'Le liste sono salvate solo su questo dispositivo.'}
			<a class="underline" href={resolve('/app/account')}>Gestisci la sincronizzazione</a>
		</p>
	</section>

	<section>
		<h2 class="font-semibold">Zona pericolosa</h2>
		<button
			class="mt-2 flex items-center gap-2 rounded-xl border border-danger/40 px-4 py-3 text-danger"
			onclick={remove}
		>
			<Icon name="trash" size={18} /> Elimina lista
		</button>
	</section>
</main>
