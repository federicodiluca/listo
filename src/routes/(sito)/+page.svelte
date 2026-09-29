<script lang="ts">
	import { resolve } from '$app/paths';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { site } from '$lib/site';
</script>

<svelte:head>
	<title>{site.name} — liste con categorie multiple</title>
	<meta
		name="description"
		content="Liste personalizzabili in cui ogni elemento può stare in più categorie. I dati restano sul tuo dispositivo o sul tuo Google Drive."
	/>
	<meta name="author" content={site.author.name} />
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-16">
	<h1 class="text-4xl font-bold">{site.name}</h1>
	<p class="mt-4 text-lg">
		Liste personalizzabili in cui ogni elemento può stare in più categorie.
	</p>
	<a
		href={resolve('/app')}
		class="mt-8 inline-block rounded-xl bg-primary px-5 py-3 font-medium text-on-primary"
		>Apri l'app</a
	>
	<p class="mt-4 text-sm text-muted">In costruzione.</p>
</main>

<SiteFooter />
