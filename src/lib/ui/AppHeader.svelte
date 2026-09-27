<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { asset } from '$app/paths';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		title,
		heading,
		back,
		actions
	}: {
		title: string;
		/** Replaces the plain title, e.g. with the list switcher. */
		heading?: Snippet;
		/** Already resolved href of the parent screen; shows a back arrow when set. */
		back?: string;
		actions?: Snippet;
	} = $props();

	// Where we came from. If it is the page the arrow points to, going "back" through
	// history (like Android's back button) instead of following the link restores
	// that page's state: scroll position and snapshots such as filters.
	let previous = $state<string>();
	afterNavigate(({ from }) => (previous = from?.url.pathname));

	function goBack(event: MouseEvent) {
		if (back && previous === new URL(back, location.href).pathname) {
			event.preventDefault();
			history.back();
		}
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- `back` is resolved by the caller -->
<header
	class="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75"
>
	<div class="mx-auto flex h-14 max-w-xl items-center gap-2 px-4">
		{#if back}
			<a
				href={back}
				class="-ml-2 grid size-10 place-items-center rounded-lg"
				aria-label="Indietro"
				onclick={goBack}
			>
				<Icon name="back" />
			</a>
		{:else}
			<img src={asset('/favicon.svg')} alt="" class="size-7" />
		{/if}
		{#if heading}
			{@render heading()}
		{:else}
			<h1 class="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
		{/if}
		{@render actions?.()}
	</div>
</header>
