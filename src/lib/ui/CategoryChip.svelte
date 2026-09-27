<script lang="ts">
	import { colorValue } from '$lib/data/palette';
	import type { CategoryDraft } from '$lib/data/types';

	let { category }: { category: CategoryDraft } = $props();
</script>

<!-- Tinted with the category color; color-mix keeps it readable in light and dark mode -->
<span
	class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm whitespace-nowrap"
	style:--c={colorValue(category.color)}
	style:border-color="color-mix(in oklab, var(--c) 55%, transparent)"
	style:background="color-mix(in oklab, var(--c) 16%, transparent)"
>
	{#if category.emoji}<span aria-hidden="true">{category.emoji}</span>{/if}
	{category.name}
</span>
