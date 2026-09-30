<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SiteFooter from '$lib/site-ui/SiteFooter.svelte';
	import SiteHeader from '$lib/site-ui/SiteHeader.svelte';

	// With the SPA fallback (adapter-static, 404.html) every unknown address ends up here
	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Pagina non trovata' : 'Errore'} — Listo</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<SiteHeader />
<main class="mx-auto max-w-xl px-4 py-16 text-center">
	<p class="text-sm font-semibold tracking-widest text-muted uppercase">Errore {page.status}</p>
	{#if notFound}
		<h1 class="mt-2 text-3xl font-bold text-balance sm:text-4xl">
			Questa pagina non sta in nessuna categoria
		</h1>
		<p class="mt-4 text-muted">
			E dire che qui ogni cosa può stare in più di una. L'abbiamo cercata in tutte le liste: non
			c'è, forse ha cambiato indirizzo.
		</p>

		<!-- the missing page as a list item: two categories, and an expiry already past -->
		<div class="mx-auto mt-8 max-w-sm rounded-2xl border border-line bg-surface p-4 text-left">
			<div class="flex items-baseline justify-between gap-3">
				<p class="font-semibold">La pagina che cercavi</p>
				<p class="text-sm font-bold whitespace-nowrap text-accent">scaduta</p>
			</div>
			<div class="mt-2 flex flex-wrap gap-2 text-sm font-medium">
				<span class="rounded-full bg-[#fde2e0] px-3 py-0.5 text-[#b3261e]">Non trovate</span>
				<span class="rounded-full bg-[#e6eefc] px-3 py-0.5 text-[#1f4fa8]">Refusi</span>
			</div>
		</div>
	{:else}
		<h1 class="mt-2 text-3xl font-bold sm:text-4xl">Qualcosa è andato storto</h1>
		<p class="mt-4 text-muted">{page.error?.message}</p>
	{/if}

	<div class="mt-8 flex flex-wrap justify-center gap-3">
		<a class="rounded-xl bg-primary px-5 py-3 font-medium text-on-primary" href={resolve('/app')}
			>Apri le tue liste</a
		>
		<a class="rounded-xl border border-line px-5 py-3 font-medium" href={resolve('/')}
			>Vai alla home</a
		>
	</div>
</main>
<SiteFooter />
