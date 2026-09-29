<script lang="ts">
	import { getListContext } from '$lib/data/list-context';
	import { setCategoryDefault } from '$lib/data/fields';
	import { addCategory, deleteCategory, moveCategory, updateCategory } from '$lib/data/lists';
	import CategoryRow from '$lib/ui/CategoryRow.svelte';
	import FieldInput from '$lib/ui/FieldInput.svelte';
	import NewCategoryForm from '$lib/ui/NewCategoryForm.svelte';

	const context = getListContext();
	const list = $derived(context.summary.list);
	const categories = $derived(context.summary.categories);
	const fields = $derived(context.summary.fields);

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
			>
				{#if fields.length}
					{@const set = fields.filter((f) => f.id in category.defaults).length}
					<details class="mt-2 ml-13 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
						<summary class="cursor-pointer text-muted">
							Valori predefiniti{set ? ` · ${set}` : ''}
						</summary>
						<p class="mt-2 text-muted">
							Quando dai questa categoria a un elemento, i suoi campi vuoti prendono questi valori.
						</p>
						{#each fields as field (field.id)}
							<div class="mt-3">
								<label class="font-medium" for="default-{category.id}-{field.id}"
									>{field.name}</label
								>
								<div class="mt-1">
									<FieldInput
										id="default-{category.id}-{field.id}"
										{field}
										value={category.defaults[field.id]}
										onchange={(value) => setCategoryDefault(category.id, field, value)}
									/>
								</div>
							</div>
						{/each}
					</details>
				{/if}
			</CategoryRow>
		{/each}
	</ul>
	<NewCategoryForm
		usedColors={categories.map((c) => c.color)}
		onadd={(draft) => addCategory(list.id, draft)}
	/>
</main>
