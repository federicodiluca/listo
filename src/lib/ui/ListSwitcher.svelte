<script lang="ts">
	import { resolve } from '$app/paths';
	import { live } from '$lib/data/live.svelte';
	import { getListSummaries } from '$lib/data/lists';
	import type { List } from '$lib/data/types';
	import Icon from './Icon.svelte';

	let { current }: { current: List } = $props();

	const id = $props.id();
	const summaries = live(() => null, getListSummaries);
	let sheet: HTMLElement;

	// The layout stays mounted while navigating between lists, so close explicitly
	const close = () => sheet.hidePopover();
</script>

<h1 class="min-w-0 flex-1">
	<button
		popovertarget="{id}-lists"
		class="-ml-1 flex max-w-full items-center gap-1 rounded-lg px-1 py-1 text-lg font-semibold"
		aria-label="Lista: {current.name}. Cambia lista"
	>
		<span class="truncate">{current.name}</span>
		<span class="shrink-0 text-muted"><Icon name="down" size={18} /></span>
	</button>
</h1>

<div popover id="{id}-lists" class="sheet" bind:this={sheet}>
	<h2 class="mb-2 font-semibold">Le tue liste</h2>
	<ul class="divide-y divide-line">
		{#each summaries.current ?? [] as { list, categories } (list.id)}
			<li>
				<a
					href={resolve('/app/lista/[id]', { id: list.id })}
					class="flex items-center gap-3 py-3"
					aria-current={list.id === current.id ? 'page' : undefined}
					onclick={close}
				>
					<span class="min-w-0 flex-1">
						<span class="block truncate font-medium">{list.name}</span>
						<span class="block text-sm text-muted">
							{categories.length === 1 ? '1 categoria' : `${categories.length} categorie`}
						</span>
					</span>
					{#if list.id === current.id}<span class="text-accent"><Icon name="check" /></span>{/if}
				</a>
			</li>
		{/each}
	</ul>
	<div class="mt-3 flex gap-2">
		<a
			href={resolve('/app/nuova')}
			class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-on-primary"
			onclick={close}
		>
			<Icon name="plus" /> Nuova lista
		</a>
		<a
			href={resolve('/app/liste')}
			class="flex flex-1 items-center justify-center rounded-xl border border-line py-3"
			onclick={close}>Tutte le liste</a
		>
	</div>
</div>
