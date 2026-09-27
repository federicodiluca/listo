<script lang="ts">
	import { asset } from '$app/paths';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		title,
		back,
		actions
	}: {
		title: string;
		/** Already resolved href of the parent screen; shows a back arrow when set. */
		back?: string;
		actions?: Snippet;
	} = $props();
</script>

<header
	class="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75"
>
	<div class="mx-auto flex h-14 max-w-xl items-center gap-2 px-4">
		{#if back}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is resolved by the caller -->
			<a href={back} class="-ml-2 grid size-10 place-items-center rounded-lg" aria-label="Indietro">
				<Icon name="back" />
			</a>
		{:else}
			<img src={asset('/favicon.svg')} alt="" class="size-7" />
		{/if}
		<h1 class="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
		{@render actions?.()}
	</div>
</header>
