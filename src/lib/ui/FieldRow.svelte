<script lang="ts">
	import { canBeExpiry, fieldTypes } from '$lib/data/field-values';
	import type { FieldDraft } from '$lib/data/types';
	import Icon from './Icon.svelte';

	/** One custom field in the settings: name, type, options, order, delete. */
	let {
		field,
		first,
		last,
		onchange,
		onmove,
		ondelete
	}: {
		field: FieldDraft;
		first: boolean;
		last: boolean;
		onchange: (changes: Partial<Pick<FieldDraft, 'name' | 'expiry' | 'showInList'>>) => void;
		onmove: (direction: -1 | 1) => void;
		ondelete: () => void;
	} = $props();

	const typeLabel = $derived(fieldTypes.find((t) => t.type === field.type)?.label ?? '');
	const iconButton =
		'grid size-9 place-items-center rounded-lg text-muted hover:bg-bg disabled:opacity-30';

	function commitName(input: HTMLInputElement) {
		const name = input.value.trim();
		if (name && name !== field.name) onchange({ name });
		else input.value = field.name;
	}
</script>

<li class="py-3">
	<div class="flex items-center gap-2">
		<input
			class="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5"
			value={field.name}
			aria-label="Nome del campo"
			enterkeyhint="done"
			onchange={(event) => commitName(event.currentTarget)}
			onkeydown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
		/>
		<span class="shrink-0 rounded-lg bg-bg px-2 py-1 text-xs text-muted">{typeLabel}</span>
		<div class="flex flex-col">
			<button class={iconButton} disabled={first} aria-label="Sposta su" onclick={() => onmove(-1)}>
				<Icon name="up" size={18} />
			</button>
			<button class={iconButton} disabled={last} aria-label="Sposta giù" onclick={() => onmove(1)}>
				<Icon name="down" size={18} />
			</button>
		</div>
		<button class={iconButton} aria-label="Elimina {field.name}" onclick={ondelete}>
			<Icon name="trash" size={18} />
		</button>
	</div>
	<div class="mt-2 flex flex-wrap gap-x-5 gap-y-2 pl-1 text-sm">
		{#if canBeExpiry(field.type)}
			<label class="flex items-center gap-2">
				<input
					type="checkbox"
					class="size-4 accent-(--color-accent)"
					checked={field.expiry}
					onchange={(e) => onchange({ expiry: e.currentTarget.checked })}
				/>
				È una scadenza
			</label>
		{/if}
		<label class="flex items-center gap-2">
			<input
				type="checkbox"
				class="size-4 accent-(--color-accent)"
				checked={field.showInList}
				onchange={(e) => onchange({ showInList: e.currentTarget.checked })}
			/>
			Mostra nella lista
		</label>
	</div>
</li>
