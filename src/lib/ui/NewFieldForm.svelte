<script lang="ts">
	import { canBeExpiry, fieldTypes } from '$lib/data/field-values';
	import type { FieldDraft, FieldType } from '$lib/data/types';
	import Icon from './Icon.svelte';

	let { onadd }: { onadd: (draft: FieldDraft) => void } = $props();

	let name = $state('');
	let type = $state<FieldType>('date');
	const hint = $derived(fieldTypes.find((t) => t.type === type)?.hint ?? '');

	function add(event: SubmitEvent) {
		event.preventDefault();
		if (!name.trim()) return;
		// a new date or duration field is most likely meant as an expiry
		onadd({ name, type, expiry: canBeExpiry(type), showInList: canBeExpiry(type) });
		name = '';
	}
</script>

<form class="py-3" onsubmit={add}>
	<div class="flex items-center gap-2">
		<input
			class="min-w-0 flex-1 rounded-xl border border-dashed border-line bg-surface px-3 py-2.5"
			placeholder="Nuovo campo"
			aria-label="Nome del nuovo campo"
			enterkeyhint="done"
			bind:value={name}
		/>
		<select
			class="rounded-xl border border-line bg-surface px-2 py-2.5"
			aria-label="Tipo del nuovo campo"
			bind:value={type}
		>
			{#each fieldTypes as option (option.type)}
				<option value={option.type}>{option.label}</option>
			{/each}
		</select>
		<button
			class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-on-primary disabled:opacity-40"
			disabled={!name.trim()}
			aria-label="Aggiungi campo"
		>
			<Icon name="plus" />
		</button>
	</div>
	<p class="mt-1.5 pl-1 text-xs text-muted">{hint}</p>
</form>
