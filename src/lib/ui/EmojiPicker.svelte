<script lang="ts" module>
	// A short, food-and-home oriented selection; any other emoji can be typed below.
	// Split by grapheme, not with [...string]: that splits by code point and would
	// break "❤️" (heart + invisible variation selector) in two.
	const emojis = [
		...new Intl.Segmenter('it', { granularity: 'grapheme' }).segment(
			'🥩🍗🥓🐟🦐🦑🥚🧀🥛🧈🥦🥕🌽🍅🥔🧅🍄🥬🫑🫛🍎🍋🍓🫐🍇🍌🍑🍒🥝🥥' +
				'🍲🍝🍕🥟🍜🥘🍛🥗🍔🌮🍞🥐🥖🍰🍨🍪🍫🍩🧁🍯🍚🥫🫘🫒🧂🥜☕🍷🍺🧃' +
				'🧴🧻🧼🧽💊🐶🐱⭐❤️🏠'
		)
	].map((s) => s.segment);
</script>

<script lang="ts">
	import { firstGrapheme } from '$lib/data/text';

	let { value, onpick }: { value: string; onpick: (emoji: string) => void } = $props();

	const id = $props.id();
	let sheet: HTMLElement;
	let typed = $state('');

	function pick(emoji: string) {
		onpick(emoji);
		typed = '';
		sheet.hidePopover();
	}
</script>

<button
	type="button"
	popovertarget="{id}-emoji"
	class="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-xl"
	aria-label={value ? `Emoji: ${value}. Cambia emoji` : 'Aggiungi emoji'}
>
	{#if value}{value}{:else}<span class="text-base text-muted" aria-hidden="true">☺︎</span>{/if}
</button>

<div popover id="{id}-emoji" class="sheet" bind:this={sheet}>
	<h2 class="mb-3 font-semibold">Emoji</h2>
	<div class="grid grid-cols-8 gap-1 sm:grid-cols-10">
		{#each emojis as emoji (emoji)}
			<button
				type="button"
				class="grid aspect-square place-items-center rounded-lg text-2xl hover:bg-bg"
				class:bg-bg={emoji === value}
				onclick={() => pick(emoji)}>{emoji}</button
			>
		{/each}
	</div>
	<form
		class="mt-4 flex gap-2"
		onsubmit={(event) => {
			event.preventDefault();
			if (firstGrapheme(typed)) pick(firstGrapheme(typed));
		}}
	>
		<input
			class="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2"
			placeholder="Oppure scrivine uno dalla tastiera"
			bind:value={typed}
		/>
		<button class="rounded-xl bg-primary px-4 text-on-primary">Usa</button>
	</form>
	{#if value}
		<button type="button" class="mt-3 text-sm text-muted underline" onclick={() => pick('')}>
			Nessuna emoji
		</button>
	{/if}
</div>
