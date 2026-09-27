<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { live } from '$lib/data/live.svelte';
	import {
		addCategory,
		deleteCategory,
		deleteList,
		getListSummary,
		moveCategory,
		renameList,
		updateCategory
	} from '$lib/data/lists';
	import AppHeader from '$lib/ui/AppHeader.svelte';
	import CategoryRow from '$lib/ui/CategoryRow.svelte';
	import Icon from '$lib/ui/Icon.svelte';
	import NewCategoryForm from '$lib/ui/NewCategoryForm.svelte';

	const summary = live(() => page.params.id ?? '', getListSummary);
	let renaming = $state(false);

	async function rename(event: SubmitEvent) {
		event.preventDefault();
		const input = new FormData(event.currentTarget as HTMLFormElement).get('name');
		if (summary.current && typeof input === 'string' && input.trim()) {
			await renameList(summary.current.list.id, input);
		}
		renaming = false;
	}

	async function remove() {
		const list = summary.current?.list;
		if (!list) return;
		if (!confirm(`Eliminare «${list.name}» con tutto il suo contenuto? Non si può annullare.`)) {
			return;
		}
		await deleteList(list.id);
		await goto(resolve('/app'), { replaceState: true });
	}

	async function removeCategory(id: string, name: string) {
		if (
			confirm(`Eliminare la categoria «${name}»? Gli elementi restano, senza questa categoria.`)
		) {
			await deleteCategory(id);
		}
	}
</script>

<svelte:head>
	<title>{summary.current?.list.name ?? 'Lista'} — Listo</title>
</svelte:head>

{#if summary.current === null}
	<AppHeader title="Lista non trovata" back={resolve('/app')} />
	<main class="mx-auto max-w-xl px-4 py-10 text-center">
		<p class="text-muted">Questa lista non esiste più, o non è su questo dispositivo.</p>
		<a href={resolve('/app')} class="mt-4 inline-block underline">Torna alle tue liste</a>
	</main>
{:else if summary.current}
	{@const { list, categories } = summary.current}
	<AppHeader title={list.name} back={resolve('/app')}>
		{#snippet actions()}
			<button
				class="grid size-10 place-items-center rounded-lg"
				aria-label="Rinomina lista"
				onclick={() => (renaming = true)}
			>
				<Icon name="pencil" />
			</button>
		{/snippet}
	</AppHeader>

	<main class="mx-auto max-w-xl px-4 py-6">
		{#if renaming}
			<form class="mb-6 flex gap-2" onsubmit={rename}>
				<input
					name="name"
					class="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5"
					value={list.name}
					aria-label="Nome della lista"
					{@attach (input) => input.focus()}
				/>
				<button class="rounded-xl bg-primary px-4 text-on-primary">Salva</button>
				<button
					type="button"
					class="rounded-xl border border-line px-4"
					onclick={() => (renaming = false)}>Annulla</button
				>
			</form>
		{/if}

		<section
			class="rounded-2xl border border-dashed border-line p-6 text-center text-muted"
			aria-label="Elementi"
		>
			Qui arriveranno gli elementi della lista.
		</section>

		<h2 class="mt-8 font-semibold">Categorie</h2>
		<ul class="mt-2 divide-y divide-line">
			{#each categories as category, i (category.id)}
				<CategoryRow
					{category}
					first={i === 0}
					last={i === categories.length - 1}
					onchange={(changes) => updateCategory(category.id, changes)}
					onmove={(direction) => moveCategory(category.id, direction)}
					ondelete={() => removeCategory(category.id, category.name)}
				/>
			{/each}
		</ul>
		<NewCategoryForm
			usedColors={categories.map((c) => c.color)}
			onadd={(draft) => addCategory(list.id, draft)}
		/>

		<button class="mt-12 flex items-center gap-2 text-sm text-danger" onclick={remove}>
			<Icon name="trash" size={16} /> Elimina lista
		</button>
	</main>
{/if}
