<script lang="ts">
	import { colorValue } from '$lib/data/palette';
	import type { Category } from '$lib/data/types';

	/** Compact category marker for item rows: the emoji on a tinted disc, or a plain dot. */
	let { category }: { category: Category } = $props();
</script>

<span
	class="grid size-7 place-items-center rounded-full border-2 border-surface text-sm"
	style:--c={colorValue(category.color)}
	style:background={category.emoji
		? 'color-mix(in oklab, var(--c) 25%, var(--color-surface))'
		: 'var(--c)'}
	title={category.name}
	aria-hidden="true">{category.emoji}</span
>
