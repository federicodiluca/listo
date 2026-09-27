<script lang="ts">
	import { colorNames, colorValue, palette, type ColorName } from '$lib/data/palette';

	let { value, onpick }: { value: ColorName; onpick: (color: ColorName) => void } = $props();

	const id = $props.id();
	let sheet: HTMLElement;

	function pick(color: ColorName) {
		onpick(color);
		sheet.hidePopover();
	}
</script>

<button
	type="button"
	popovertarget="{id}-colors"
	class="grid size-11 shrink-0 place-items-center rounded-xl border border-line"
	aria-label="Colore: {palette[value].label}. Cambia colore"
>
	<span class="size-6 rounded-full" style:background={colorValue(value)}></span>
</button>

<div popover id="{id}-colors" class="sheet" bind:this={sheet}>
	<h2 class="mb-3 font-semibold">Colore</h2>
	<div class="grid grid-cols-4 gap-3">
		{#each colorNames as color (color)}
			<button
				type="button"
				class="flex flex-col items-center gap-1 rounded-xl p-2 text-xs text-muted"
				class:ring-2={color === value}
				class:ring-ink={color === value}
				aria-pressed={color === value}
				onclick={() => pick(color)}
			>
				<span class="size-9 rounded-full" style:background={colorValue(color)}></span>
				{palette[color].label}
			</button>
		{/each}
	</div>
</div>
