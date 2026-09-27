<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getItems } from '$lib/data/items';
	import { setListContext } from '$lib/data/list-context';
	import { live } from '$lib/data/live.svelte';
	import { getListSummary } from '$lib/data/lists';
	import { setLastListId } from '$lib/prefs';
	import AppHeader from '$lib/ui/AppHeader.svelte';

	let { children } = $props();

	const id = $derived(page.params.id ?? '');
	const summary = live(() => id, getListSummary);
	const items = live(() => id, getItems);

	setListContext({
		get summary() {
			return summary.current!;
		},
		get items() {
			return items.current ?? [];
		}
	});

	$effect(() => {
		if (summary.current) setLastListId(summary.current.list.id);
	});
</script>

{#if summary.current === null}
	<AppHeader title="Lista non trovata" back={resolve('/app/liste')} />
	<main class="mx-auto max-w-xl px-4 py-10 text-center">
		<p class="text-muted">Questa lista non esiste più, o non è su questo dispositivo.</p>
		<a href={resolve('/app/liste')} class="mt-4 inline-block underline">Vai alle tue liste</a>
	</main>
{:else if summary.current && items.current}
	{@render children()}
{/if}
