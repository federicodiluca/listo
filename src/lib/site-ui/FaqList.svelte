<script lang="ts">
	import type { Faq } from '$lib/seo/jsonld';

	let { faqs, title = 'Domande frequenti' }: { faqs: Faq[]; title?: string } = $props();
</script>

<!-- Native <details>: opens without JavaScript and the answers stay in the HTML crawlers read -->
<section class="mx-auto max-w-3xl px-4 py-12" aria-labelledby="faq-title">
	<h2 id="faq-title" class="text-2xl font-bold sm:text-3xl">{title}</h2>
	<div class="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
		{#each faqs as faq (faq.question)}
			<details class="group px-5 py-4">
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-4 font-medium"
				>
					<h3>{faq.question}</h3>
					<span class="text-muted transition group-open:rotate-45" aria-hidden="true">+</span>
				</summary>
				<p class="mt-3 text-muted">{faq.answer}</p>
			</details>
		{/each}
	</div>
</section>
