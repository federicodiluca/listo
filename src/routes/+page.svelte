<script lang="ts">
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
	<p class="mt-2 text-sm opacity-70">In costruzione.</p>
</main>

<SiteFooter />
