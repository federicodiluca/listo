<!--
	Entry point of the app (also the future PWA start URL): jumps straight to the last
	list used on this device, so at the supermarket the freezer is one tap away.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { db } from '$lib/data/db';
	import { getLastListId } from '$lib/prefs';
	import { onMount } from 'svelte';

	onMount(async () => {
		const id = getLastListId();
		const target =
			id && (await db.lists.get(id)) ? resolve('/app/lista/[id]', { id }) : resolve('/app/liste');
		await goto(target, { replaceState: true });
	});
</script>

<svelte:head>
	<title>Listo</title>
</svelte:head>
