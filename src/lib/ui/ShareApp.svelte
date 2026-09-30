<script lang="ts">
	import Icon from './Icon.svelte';

	/*
	 * "Consiglia Listo": the story image (static/story.png, `npm run story:build`) with the
	 * system share menu, where one picks Instagram → Story. Where the browser can't share
	 * files, the image is downloaded instead. The file is fetched once the preview has loaded,
	 * so a tap on "Condividi" finds it ready: Safari refuses to share when a network wait
	 * sits between the tap and the call.
	 */
	let { button }: { button: string } = $props();

	const IMAGE = '/story.png';
	const TEXT =
		'Listo: liste in cui ogni cosa può stare in più categorie. Gratis, senza account.\nhttps://listo.federicodiluca.com/';

	let file = $state<File>();

	async function load() {
		try {
			const res = await fetch(IMAGE);
			if (res.ok) file = new File([await res.blob()], 'listo.png', { type: 'image/png' });
		} catch {
			// no file: the buttons stay disabled
		}
	}

	function download() {
		if (!file) return;
		const href = URL.createObjectURL(file);
		const a = document.createElement('a');
		a.href = href;
		a.download = file.name;
		a.click();
		URL.revokeObjectURL(href);
	}

	async function share() {
		if (!file) return;
		if (!navigator.canShare?.({ files: [file] })) return download();
		try {
			await navigator.share({ files: [file], text: TEXT });
		} catch (e) {
			if ((e as Error).name !== 'AbortError') download();
		}
	}
</script>

<section>
	<h2 class="text-lg font-semibold">Consiglia Listo</h2>
	<p class="mt-2 text-muted">
		Un'immagine pronta per le storie di Instagram, con il link scritto sopra. Dal telefono,
		"Condividi" apre il menu del sistema: scegli Instagram e poi Storia.
	</p>
	<img
		src={IMAGE}
		alt="Listo: il minestrone sta sia in verdura sia in piatti pronti"
		width="1080"
		height="1920"
		loading="lazy"
		class="mx-auto mt-4 h-72 w-auto rounded-xl border border-line"
		onload={load}
	/>
	<div class="mt-4 grid grid-cols-2 gap-3">
		<button type="button" class="{button} border border-line" disabled={!file} onclick={download}>
			<Icon name="download" /> Scarica
		</button>
		<button
			type="button"
			class="{button} bg-primary text-on-primary"
			disabled={!file}
			onclick={share}
		>
			<Icon name="share" /> Condividi
		</button>
	</div>
</section>
