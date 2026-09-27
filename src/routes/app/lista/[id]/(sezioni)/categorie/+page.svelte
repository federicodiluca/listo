<script lang="ts">
	import { getListContext } from '$lib/data/list-context';
	import { addCategory, deleteCategory, moveCategory, updateCategory } from '$lib/data/lists';
	import CategoryRow from '$lib/ui/CategoryRow.svelte';
	import NewCategoryForm from '$lib/ui/NewCategoryForm.svelte';

	const context = getListContext();
	const list = $derived(context.summary.list);
	const categories = $derived(context.summary.categories);

	/** How many active items use each category, to warn before deleting it. */
	const usage = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const item of context.items) {
			if (item.archivedAt) continue;
			for (const id of item.categoryIds) counts[id] = (counts[id] ?? 0) + 1;
		}
		return counts;
	});

	async function remove(id: string, name: string) {
		const used = usage[id] ?? 0;
		const detail = used
			? `${used === 1 ? '1 elemento la usa' : `${used} elementi la usano`}: resteranno, senza questa categoria.`
			: 'Nessun elemento la usa.';
		if (confirm(`Eliminare la categoria «${name}»? ${detail}`)) await deleteCategory(id);
	}
</script>

<svelte:head>
	<title>Categorie · {list.name} — Listo</title>
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-6">
	<p class="text-sm text-muted">
		Un elemento può stare in più categorie. L'ordine qui è anche quello dei gruppi quando ordini gli
		elementi per categoria.
	</p>
	<ul class="mt-2 divide-y divide-line">
		{#each categories as category, i (category.id)}
			<CategoryRow
				{category}
				first={i === 0}
				last={i === categories.length - 1}
				onchange={(changes) => updateCategory(category.id, changes)}
				onmove={(direction) => moveCategory(category.id, direction)}
				ondelete={() => remove(category.id, category.name)}
			/>
		{/each}
	</ul>
	<NewCategoryForm
		usedColors={categories.map((c) => c.color)}
		onadd={(draft) => addCategory(list.id, draft)}
	/>
</main>
