<script lang="ts">
	import { nextColor, type ColorName } from '$lib/data/palette';
	import type { CategoryDraft } from '$lib/data/types';
	import ColorPicker from './ColorPicker.svelte';
	import EmojiPicker from './EmojiPicker.svelte';
	import Icon from './Icon.svelte';

	let {
		usedColors,
		onadd
	}: { usedColors: readonly string[]; onadd: (draft: CategoryDraft) => void } = $props();

	let emoji = $state('');
	let name = $state('');
	// null = "not chosen by the user yet": follow the first unused palette color
	let chosenColor = $state<ColorName | null>(null);
	let color = $derived(chosenColor ?? nextColor(usedColors));

	function add(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim()) return;
		onadd({ emoji, name, color });
		emoji = '';
		name = '';
		chosenColor = null;
	}
</script>

<form class="flex items-center gap-2 py-2" onsubmit={add}>
	<EmojiPicker value={emoji} onpick={(value) => (emoji = value)} />
	<input
		class="min-w-0 flex-1 rounded-xl border border-dashed border-line bg-surface px-3 py-2.5"
		placeholder="Nuova categoria"
		aria-label="Nome nuova categoria"
		enterkeyhint="done"
		bind:value={name}
	/>
	<ColorPicker value={color} onpick={(value) => (chosenColor = value)} />
	<button
		class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-on-primary disabled:opacity-40"
		disabled={!name.trim()}
		aria-label="Aggiungi categoria"
	>
		<Icon name="plus" />
	</button>
</form>
