<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { formatDate, today } from '$lib/data/dates';
	import {
		archiveItem,
		deleteItem,
		parseQuantity,
		restoreItem,
		toggleItemCategory,
		updateItem
	} from '$lib/data/items';
	import { getListContext } from '$lib/data/list-context';
	import { colorValue } from '$lib/data/palette';
	import type { ItemDraft } from '$lib/data/types';
	import AppHeader from '$lib/ui/AppHeader.svelte';
	import Icon from '$lib/ui/Icon.svelte';

	const context = getListContext();
	const list = $derived(context.summary.list);
	const categories = $derived(context.summary.categories);
	const item = $derived(context.items.find((i) => i.id === page.params.itemId));
	const back = $derived(resolve('/app/lista/[id]', { id: list.id }));

	/** Units already used in this list, offered as suggestions. */
	const units = $derived(
		[...new Set(context.items.map((i) => i.unit).filter(Boolean))].sort((a, b) =>
			a.localeCompare(b, 'it')
		)
	);

	let error = $state('');

	/** Saves one field; on invalid input shows the message and puts the stored value back. */
	async function save(changes: Partial<ItemDraft>, field?: HTMLInputElement, stored?: string) {
		if (!item) return;
		try {
			await updateItem(item.id, changes);
			error = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Modifica non salvata.';
			if (field && stored !== undefined) field.value = stored;
		}
	}

	function saveQuantity(field: HTMLInputElement) {
		if (!item) return;
		const stored = item.quantity === null ? '' : String(item.quantity).replace('.', ',');
		try {
			save({ quantity: parseQuantity(field.value) }, field, stored);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Quantità non valida.';
			field.value = stored;
		}
	}

	async function archive() {
		if (!item) return;
		await archiveItem(item.id);
		await goto(back);
	}

	async function remove() {
		if (!item || !confirm(`Eliminare «${item.name}» per sempre?`)) return;
		await deleteItem(item.id);
		await goto(back, { replaceState: true });
	}

	const input = 'w-full rounded-xl border border-line bg-surface px-3 py-2.5';
</script>

<svelte:head>
	<title>{item?.name ?? 'Elemento'} · {list.name} — Listo</title>
</svelte:head>

<AppHeader title={item?.name ?? 'Elemento non trovato'} {back} />

{#if !item}
	<main class="mx-auto max-w-xl px-4 py-10 text-center text-muted">
		<p>Questo elemento non esiste più.</p>
		<a href={back} class="mt-4 inline-block underline">Torna a {list.name}</a>
	</main>
{:else}
	<main class="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6 pb-16">
		{#if item.archivedAt}
			<div class="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
				<p class="flex-1 text-sm">
					Archiviato il {formatDate(item.archivedAt.slice(0, 10))}.
				</p>
				<button
					class="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm text-on-primary"
					onclick={() => restoreItem(item.id)}
				>
					<Icon name="restore" size={16} /> Rimetti in lista
				</button>
			</div>
		{/if}

		<div>
			<label class="font-semibold" for="item-name">Nome</label>
			<input
				id="item-name"
				class="mt-2 {input} text-lg"
				value={item.name}
				enterkeyhint="done"
				onchange={(e) => save({ name: e.currentTarget.value }, e.currentTarget, item.name)}
			/>
		</div>

		<div class="grid grid-cols-[7rem_1fr] gap-3">
			<div>
				<label class="font-semibold" for="item-quantity">Quantità</label>
				<input
					id="item-quantity"
					class="mt-2 {input}"
					inputmode="decimal"
					placeholder="—"
					value={item.quantity === null ? '' : String(item.quantity).replace('.', ',')}
					onchange={(e) => saveQuantity(e.currentTarget)}
				/>
			</div>
			<div>
				<label class="font-semibold" for="item-unit">Unità</label>
				<input
					id="item-unit"
					class="mt-2 {input}"
					list="item-units"
					placeholder="porzioni, g, sacchetti…"
					value={item.unit}
					onchange={(e) => save({ unit: e.currentTarget.value })}
				/>
				<datalist id="item-units">
					{#each units as unit (unit)}<option value={unit}></option>{/each}
				</datalist>
			</div>
		</div>

		<div>
			<h2 class="font-semibold">Categorie</h2>
			{#if categories.length}
				<div class="mt-2 flex flex-wrap gap-2" role="group" aria-label="Categorie dell'elemento">
					{#each categories as category (category.id)}
						{@const on = item.categoryIds.includes(category.id)}
						<button
							class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
							style:--c={colorValue(category.color)}
							style:border-color={on ? 'var(--c)' : 'var(--color-line)'}
							style:background={on
								? 'color-mix(in oklab, var(--c) 22%, transparent)'
								: 'transparent'}
							aria-pressed={on}
							onclick={() => toggleItemCategory(item.id, category.id)}
						>
							{#if on}<Icon name="check" size={16} />{/if}
							{#if category.emoji}<span aria-hidden="true">{category.emoji}</span>{/if}
							{category.name}
						</button>
					{/each}
				</div>
			{:else}
				<p class="mt-2 text-sm text-muted">
					Questa lista non ha categorie.
					<a
						class="underline"
						href={resolve('/app/lista/[id]/(sezioni)/categorie', { id: list.id })}
						>Creane qualcuna</a
					>.
				</p>
			{/if}
		</div>

		<div>
			<label class="font-semibold" for="item-date">Aggiunto il</label>
			<div class="mt-2 flex gap-2">
				<input
					id="item-date"
					type="date"
					class="{input} flex-1"
					value={item.addedOn}
					max={today()}
					onchange={(e) =>
						e.currentTarget.value &&
						save({ addedOn: e.currentTarget.value }, e.currentTarget, item.addedOn)}
				/>
				{#if item.addedOn !== today()}
					<button
						class="rounded-xl border border-line px-4"
						onclick={() => save({ addedOn: today() })}>Oggi</button
					>
				{/if}
			</div>
		</div>

		<div>
			<label class="font-semibold" for="item-note">Nota</label>
			<textarea
				id="item-note"
				class="mt-2 {input} min-h-24"
				placeholder="Es. con farro, della nonna, scade a marzo…"
				value={item.note}
				onchange={(e) => save({ note: e.currentTarget.value })}></textarea>
		</div>

		{#if error}<p class="text-danger" role="alert">{error}</p>{/if}

		<div class="flex flex-wrap gap-3 border-t border-line pt-6">
			{#if !item.archivedAt}
				<button
					class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-on-primary"
					onclick={archive}
				>
					<Icon name="archive" size={18} /> Archivia
				</button>
			{/if}
			<button
				class="flex items-center justify-center gap-2 rounded-xl border border-danger/40 px-4 py-3 text-danger"
				onclick={remove}
			>
				<Icon name="trash" size={18} /> Elimina
			</button>
		</div>
		{#if !item.archivedAt}
			<p class="-mt-3 text-sm text-muted">
				Archivia quando lo finisci: la prossima volta potrai ripescarlo con le stesse categorie.
			</p>
		{/if}
	</main>
{/if}
