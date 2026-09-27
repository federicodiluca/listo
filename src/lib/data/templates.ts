import type { CategoryDraft } from './types';

export type ListTemplate = {
	id: string;
	emoji: string;
	name: string;
	description: string;
	categories: CategoryDraft[];
};

/** Starting points for a new list. Everything can be edited after creation. */
export const templates: ListTemplate[] = [
	{
		id: 'congelatore',
		emoji: '🧊',
		name: 'Congelatore',
		description: 'Cosa hai in freezer e da quando.',
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
		emoji: '🥫',
		name: 'Dispensa',
		description: 'Scorte a lunga conservazione.',
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
		emoji: '🛒',
		name: 'Lista della spesa',
		description: 'Cosa comprare, diviso per reparto.',
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
		emoji: '✏️',
		name: 'Da zero',
		description: 'Nessuna categoria: le crei tu.',
		categories: []
	}
];
