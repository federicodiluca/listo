<script lang="ts" module>
	import type { ColorName } from '$lib/data/palette';

	export type PreviewItem = {
		name: string;
		detail: string;
		categories: { emoji: string; name: string; color: ColorName }[];
	};
</script>

<script lang="ts">
	import { colorValue } from '$lib/data/palette';
	import Icon from '$lib/ui/Icon.svelte';

	/** A static, HTML-only picture of the app: sharp at any size, light and dark. */
	let {
		title,
		filters,
		items
	}: {
		title: string;
		filters: { emoji: string; name: string; color: ColorName; on?: boolean }[];
		items: PreviewItem[];
	} = $props();
</script>

<figure
	class="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border-8 border-ink/90 bg-bg shadow-2xl"
	aria-label="Anteprima dell'app Listo: lista {title}"
>
	<div class="flex items-center gap-2 border-b border-line px-4 py-3">
		<img src="/favicon.svg" alt="" class="size-6" width="24" height="24" />
		<span class="flex-1 font-semibold">{title}</span>
		<span class="text-muted"><Icon name="cloud" size={18} /></span>
	</div>
	<div class="flex gap-1.5 overflow-hidden px-3 pt-3 pb-2">
		{#each filters as f (f.name)}
			<span
				class="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs"
				style:--c={colorValue(f.color)}
				style:border-color={f.on ? 'var(--c)' : 'var(--color-line)'}
				style:background={f.on ? 'color-mix(in oklab, var(--c) 22%, transparent)' : 'transparent'}
				>{f.emoji} {f.name}</span
			>
		{/each}
	</div>
	<ul class="divide-y divide-line border-y border-line bg-surface text-left">
		{#each items as item (item.name)}
			<li class="flex items-center gap-3 px-4 py-2.5">
				<span class="min-w-0 flex-1">
					<span class="block truncate text-sm font-medium">{item.name}</span>
					<span class="block truncate text-xs text-muted">{item.detail}</span>
				</span>
				<span class="flex -space-x-1.5">
					{#each item.categories as c (c.name)}
						<span
							class="grid size-6 place-items-center rounded-full border-2 border-surface text-xs"
							style:background="color-mix(in oklab, {colorValue(c.color)} 25%, var(--color-surface))"
							title={c.name}>{c.emoji}</span
						>
					{/each}
				</span>
			</li>
		{/each}
	</ul>
	<div class="flex gap-2 px-3 py-3">
		<span class="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-muted"
			>Aggiungi un elemento…</span
		>
		<span class="grid size-8 place-items-center rounded-xl bg-primary text-on-primary"
			><Icon name="plus" size={16} /></span
		>
	</div>
	<figcaption class="sr-only">
		Lista {title} con {items.length} elementi, ciascuno con le sue categorie.
	</figcaption>
</figure>
