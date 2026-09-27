import type { IconName } from '$lib/ui/Icon.svelte';
import type { CategoryDraft, ListSort } from './types';

export type ListTemplate = {
	id: string;
	icon: IconName;
	name: string;
	description: string;
	sort: ListSort;
	categories: CategoryDraft[];
};

/** Starting points for a new list. Everything can be edited after creation. */
export const templates: ListTemplate[] = [
	{
		id: 'congelatore',
		icon: 'snowflake',
		name: 'Congelatore',
		description: 'Cosa hai in freezer e da quando.',
		// oldest first: what should be eaten soon comes up top
		sort: { field: 'addedOn', direction: 'asc' },
		categories: [
			{ emoji: '🥩', name: 'Carne', color: 'rosso' },
			{ emoji: '🐟', name: 'Pesce', color: 'azzurro' },
			{ emoji: '🥦', name: 'Verdura', color: 'verde' },
			{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio' },
			{ emoji: '🍞', name: 'Pane e impasti', color: 'marrone' },
			{ emoji: '🍨', name: 'Dolci e gelati', color: 'rosa' }
		]
	},
	{
		id: 'dispensa',
		icon: 'jar',
		name: 'Dispensa',
		description: 'Scorte a lunga conservazione.',
		sort: { field: 'category', direction: 'asc' },
		categories: [
			{ emoji: '🍝', name: 'Pasta e riso', color: 'ambra' },
			{ emoji: '🥫', name: 'Conserve', color: 'pomodoro' },
			{ emoji: '🫘', name: 'Legumi', color: 'marrone' },
			{ emoji: '🫒', name: 'Condimenti', color: 'lime' },
			{ emoji: '🍪', name: 'Colazione e snack', color: 'giallo' },
			{ emoji: '🧂', name: 'Spezie', color: 'grigio' }
		]
	},
	{
		id: 'spesa',
		icon: 'cart',
		name: 'Lista della spesa',
		description: 'Cosa comprare, diviso per reparto.',
		sort: { field: 'category', direction: 'asc' },
		categories: [
			{ emoji: '🍎', name: 'Frutta e verdura', color: 'verde' },
			{ emoji: '🧀', name: 'Latticini', color: 'giallo' },
			{ emoji: '🥩', name: 'Carne e pesce', color: 'rosso' },
			{ emoji: '🧴', name: 'Casa e igiene', color: 'acqua' },
			{ emoji: '⭐', name: 'Urgente', color: 'viola' }
		]
	},
	{
		id: 'vuota',
		icon: 'blank',
		name: 'Da zero',
		description: 'Nessuna categoria: le crei tu.',
		sort: { field: 'addedOn', direction: 'asc' },
		categories: []
	}
];
