<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getListContext } from '$lib/data/list-context';
	import AppHeader from '$lib/ui/AppHeader.svelte';
	import Icon, { type IconName } from '$lib/ui/Icon.svelte';
	import ListSwitcher from '$lib/ui/ListSwitcher.svelte';

	let { children } = $props();

	const context = getListContext();
	const id = $derived(context.summary.list.id);

	const tabs: { label: string; icon: IconName; route: string }[] = $derived([
		{ label: 'Elementi', icon: 'items', route: resolve('/app/lista/[id]', { id }) },
		{
			label: 'Categorie',
			icon: 'tag',
			route: resolve('/app/lista/[id]/(sezioni)/categorie', { id })
		},
		{
			label: 'Impostazioni',
			icon: 'settings',
			route: resolve('/app/lista/[id]/(sezioni)/impostazioni', { id })
		}
	]);
</script>

<AppHeader title={context.summary.list.name}>
	{#snippet heading()}
		<ListSwitcher current={context.summary.list} />
	{/snippet}
</AppHeader>

<!-- bottom padding keeps the last rows clear of the fixed bars -->
<div class="pb-40">
	{@render children()}
</div>

<!-- eslint-disable svelte/no-navigation-without-resolve -- tab routes are resolved in the script -->
<nav
	class="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]"
	aria-label="Sezioni della lista"
>
	<ul class="mx-auto flex h-16 max-w-xl">
		{#each tabs as tab (tab.label)}
			{@const active = page.url.pathname === tab.route}
			<li class="flex-1">
				<a
					href={tab.route}
					class="flex h-full flex-col items-center justify-center gap-0.5 text-xs {active
						? 'font-semibold text-ink'
						: 'text-muted'}"
					aria-current={active ? 'page' : undefined}
				>
					<span
						class="grid h-7 w-14 place-items-center rounded-full {active ? 'bg-accent/20' : ''}"
					>
						<Icon name={tab.icon} />
					</span>
					{tab.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
