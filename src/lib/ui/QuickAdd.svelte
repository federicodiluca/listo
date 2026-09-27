<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { addItem, matchByName, restoreItem } from '$lib/data/items';
	import type { Item } from '$lib/data/types';
	import Icon from './Icon.svelte';

	let { listId, items }: { listId: string; items: readonly Item[] } = $props();

	let name = $state('');
	let focused = $state(false);
	const matches = $derived(focused ? matchByName(items, name) : []);

	const open = (itemId: string) =>
		goto(resolve('/app/lista/[id]/elemento/[itemId]', { id: listId, itemId }));

	async function add(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim()) return;
		const id = await addItem(listId, name);
		name = '';
		await open(id);
	}

	async function bringBack(item: Item) {
		await restoreItem(item.id);
		name = '';
		await open(item.id);
	}
</script>

<!-- Sits right above the section tab bar (h-16) -->
<div
	class="fixed inset-x-0 z-20 border-t border-line bg-bg/95 backdrop-blur"
	style:bottom="calc(4rem + env(safe-area-inset-bottom))"
>
	<div class="mx-auto max-w-xl px-4 py-2">
		{#if matches.length}
			<ul class="mb-2 divide-y divide-line rounded-2xl border border-line bg-surface">
				{#each matches as { item, archived } (item.id)}
					<li class="flex items-center gap-3 px-4 py-2">
						<span class="min-w-0 flex-1 truncate">{item.name}</span>
						{#if archived}
							<!-- onpointerdown: runs before the input's blur hides this list -->
							<button
								class="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-on-primary"
								onpointerdown={(event) => {
									event.preventDefault();
									bringBack(item);
								}}
							>
								<Icon name="restore" size={16} /> Ripesca
							</button>
						{:else}
							<button
								class="rounded-lg border border-line px-3 py-1.5 text-sm text-muted"
								onpointerdown={(event) => {
									event.preventDefault();
									open(item.id);
								}}>Già in lista</button
							>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		<form class="flex gap-2" onsubmit={add}>
			<input
				class="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5"
				placeholder="Aggiungi un elemento…"
				aria-label="Nome del nuovo elemento"
				enterkeyhint="done"
				autocomplete="off"
				bind:value={name}
				onfocus={() => (focused = true)}
				onblur={() => (focused = false)}
			/>
			<button
				class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-on-primary disabled:opacity-40"
				disabled={!name.trim()}
				aria-label="Aggiungi"
			>
				<Icon name="plus" />
			</button>
		</form>
	</div>
</div>
