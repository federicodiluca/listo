<script lang="ts">
	import type { Duration, Field, FieldValue } from '$lib/data/types';
	import Icon from './Icon.svelte';

	/**
	 * Editor for one custom field value, whatever its type. Emits the new value on
	 * change, or null when the field is emptied.
	 */
	let {
		field,
		value,
		onchange,
		id
	}: {
		field: Field;
		value: FieldValue | undefined;
		onchange: (value: FieldValue | null) => void;
		/** For an external <label for>. */
		id: string;
	} = $props();

	const input = 'min-w-0 rounded-xl border border-line bg-surface px-3 py-2.5';

	// Duration: the unit is chosen before (or without) an amount, so it lives here too
	const duration = $derived(value as Duration | undefined);
	let unit = $derived<Duration['unit']>(duration?.unit ?? 'months');

	function emitDuration(amountText: string) {
		const amount = Number(amountText);
		if (amountText.trim() === '') onchange(null);
		else if (Number.isInteger(amount) && amount > 0) onchange({ amount, unit });
	}

	function emitNumber(text: string) {
		const number = Number(text.trim().replace(',', '.'));
		if (text.trim() === '') onchange(null);
		else if (Number.isFinite(number)) onchange(number);
	}
</script>

{#if field.type === 'date'}
	<div class="flex gap-2">
		<input
			{id}
			type="date"
			class="{input} flex-1"
			value={typeof value === 'string' ? value : ''}
			onchange={(e) => onchange(e.currentTarget.value || null)}
		/>
		{#if value}
			<button
				type="button"
				class="grid size-11 place-items-center rounded-xl border border-line text-muted"
				aria-label="Svuota {field.name}"
				onclick={() => onchange(null)}><Icon name="close" size={18} /></button
			>
		{/if}
	</div>
{:else if field.type === 'duration'}
	<div class="flex gap-2">
		<input
			{id}
			class="{input} w-24"
			inputmode="numeric"
			placeholder="—"
			value={duration?.amount ?? ''}
			onchange={(e) => emitDuration(e.currentTarget.value)}
		/>
		<select
			class="{input} flex-1"
			aria-label="Unità di {field.name}"
			bind:value={unit}
			onchange={() => duration && onchange({ amount: duration.amount, unit })}
		>
			<option value="days">giorni</option>
			<option value="months">mesi</option>
		</select>
	</div>
{:else if field.type === 'number'}
	<input
		{id}
		class="{input} w-full"
		inputmode="decimal"
		placeholder="—"
		value={typeof value === 'number' ? String(value).replace('.', ',') : ''}
		onchange={(e) => emitNumber(e.currentTarget.value)}
	/>
{:else if field.type === 'text'}
	<input
		{id}
		class="{input} w-full"
		value={typeof value === 'string' ? value : ''}
		onchange={(e) => onchange(e.currentTarget.value.trim() || null)}
	/>
{:else}
	<label class="flex w-fit cursor-pointer items-center gap-3">
		<input
			{id}
			type="checkbox"
			class="size-6 accent-(--color-accent)"
			checked={value === true}
			onchange={(e) => onchange(e.currentTarget.checked ? true : null)}
		/>
		<span class="text-muted">{value === true ? 'Sì' : 'No'}</span>
	</label>
{/if}
