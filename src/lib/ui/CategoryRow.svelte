<script lang="ts">
	import type { CategoryDraft } from '$lib/data/types';
	import ColorPicker from './ColorPicker.svelte';
	import EmojiPicker from './EmojiPicker.svelte';
	import Icon from './Icon.svelte';

	let {
		category,
		first,
		last,
		onchange,
		onmove,
		ondelete
	}: {
		category: CategoryDraft;
		first: boolean;
		last: boolean;
		onchange: (changes: Partial<CategoryDraft>) => void;
		onmove: (direction: -1 | 1) => void;
		ondelete: () => void;
	} = $props();

	const iconButton =
		'grid size-9 place-items-center rounded-lg text-muted hover:bg-bg disabled:opacity-30';

	/** Saves the name when the field loses focus; an emptied field goes back to the old name. */
	function commitName(input: HTMLInputElement) {
		const name = input.value.trim();
		if (name && name !== category.name) onchange({ name });
		else input.value = category.name;
	}
</script>

<li class="flex items-center gap-2 py-2">
	<EmojiPicker value={category.emoji} onpick={(emoji) => onchange({ emoji })} />
	<input
		class="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5"
		value={category.name}
		aria-label="Nome categoria"
		enterkeyhint="done"
		onchange={(event) => commitName(event.currentTarget)}
		onkeydown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
	/>
	<ColorPicker value={category.color} onpick={(color) => onchange({ color })} />
	<div class="flex flex-col">
		<button class={iconButton} disabled={first} aria-label="Sposta su" onclick={() => onmove(-1)}>
			<Icon name="up" size={18} />
		</button>
		<button class={iconButton} disabled={last} aria-label="Sposta giù" onclick={() => onmove(1)}>
			<Icon name="down" size={18} />
		</button>
	</div>
	<button class={iconButton} aria-label="Elimina {category.name}" onclick={ondelete}>
		<Icon name="trash" size={18} />
	</button>
</li>
