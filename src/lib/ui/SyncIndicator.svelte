<script lang="ts">
	import { resolve } from '$app/paths';
	import { sync } from '$lib/sync/sync.svelte';
	import Icon from './Icon.svelte';

	// What the cloud in the header says, in words (also read by screen readers)
	const label = $derived.by(() => {
		switch (sync.status) {
			case 'off':
				return 'Sincronizzazione non attiva';
			case 'syncing':
				return 'Sincronizzazione in corso';
			case 'offline':
				return 'Offline: sincronizzerò appena torna la rete';
			case 'needs-auth':
				return 'Accesso a Google scaduto: tocca per aggiornare';
			case 'error':
				return 'Errore di sincronizzazione';
			case 'idle':
				return sync.pending ? 'Modifiche da sincronizzare' : 'Sincronizzato';
		}
	});
	const dot = $derived(
		sync.status === 'error' || sync.status === 'needs-auth'
			? 'bg-danger'
			: sync.status === 'syncing' || sync.pending
				? 'bg-accent animate-pulse'
				: ''
	);
	const offline = $derived(sync.status === 'off' || sync.status === 'offline');
</script>

{#snippet cloud()}
	<span class="relative text-muted">
		<Icon name={offline ? 'cloudOff' : 'cloud'} />
		{#if dot}<span class="absolute -top-0.5 -right-0.5 size-2.5 rounded-full {dot}"></span>{/if}
	</span>
{/snippet}

{#if sync.status === 'needs-auth'}
	<!-- a button, not a link: renewing the access opens a popup, which needs this tap -->
	<button
		class="grid size-10 place-items-center rounded-lg"
		aria-label={label}
		title={label}
		onclick={() => sync.syncNow()}
	>
		{@render cloud()}
	</button>
{:else}
	<a
		href={resolve('/app/account')}
		class="grid size-10 place-items-center rounded-lg"
		aria-label="{label}. Account e sincronizzazione"
		title={label}
	>
		{@render cloud()}
	</a>
{/if}
