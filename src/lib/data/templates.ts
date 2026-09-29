import type { IconName } from '$lib/ui/Icon.svelte';
import type { CategoryDraft, FieldDraft, ListSort } from './types';

export type ListTemplate = {
	id: string;
	group: 'casa' | 'oggetti' | 'organizzazione' | 'vuota';
	icon: IconName;
	name: string;
	description: string;
	sort: ListSort;
	categories: CategoryDraft[];
	/** Extra fields the list starts with; they can be removed before creating it. */
	fields: FieldDraft[];
	expiryWarningDays?: number;
};

export const templateGroups: { id: ListTemplate['group']; label: string }[] = [
	{ id: 'casa', label: 'Casa e cucina' },
	{ id: 'oggetti', label: 'Oggetti e inventari' },
	{ id: 'organizzazione', label: 'Organizzazione' },
	{ id: 'vuota', label: 'Altro' }
];

const byDate: ListSort = { field: 'addedOn', direction: 'asc' };
const byCategory: ListSort = { field: 'category', direction: 'asc' };
const byExpiry: ListSort = { field: 'expiry', direction: 'asc' };

const expiry = (name: string, showInList = false): FieldDraft => ({
	name,
	type: 'date',
	expiry: true,
	showInList
});
const text = (name: string): FieldDraft => ({
	name,
	type: 'text',
	expiry: false,
	showInList: true
});

/**
 * Starting points for a new list. Everything can be edited after creation. No default
 * storage times for food: those are the user's call (and the label's), not the app's.
 */
export const templates: ListTemplate[] = [
	{
		id: 'congelatore',
		group: 'casa',
		icon: 'snowflake',
		name: 'Congelatore',
		description: 'Cosa hai in freezer e da quando.',
		// oldest first: what should be eaten soon comes up top
		sort: byDate,
		categories: [
			{ emoji: '🥩', name: 'Carne', color: 'rosso' },
			{ emoji: '🐟', name: 'Pesce', color: 'azzurro' },
			{ emoji: '🥦', name: 'Verdura', color: 'verde' },
			{ emoji: '🍲', name: 'Piatti pronti', color: 'arancio' },
			{ emoji: '🍞', name: 'Pane e impasti', color: 'marrone' },
			{ emoji: '🍨', name: 'Dolci e gelati', color: 'rosa' }
		],
		fields: [{ name: 'Si conserva per', type: 'duration', expiry: true, showInList: false }]
	},
	{
		id: 'dispensa',
		group: 'casa',
		icon: 'jar',
		name: 'Dispensa',
		description: 'Scorte a lunga conservazione.',
		sort: byCategory,
		categories: [
			{ emoji: '🍝', name: 'Pasta e riso', color: 'ambra' },
			{ emoji: '🥫', name: 'Conserve', color: 'pomodoro' },
			{ emoji: '🫘', name: 'Legumi', color: 'marrone' },
			{ emoji: '🫒', name: 'Condimenti', color: 'lime' },
			{ emoji: '🍪', name: 'Colazione e snack', color: 'giallo' },
			{ emoji: '🧂', name: 'Spezie', color: 'grigio' }
		],
		fields: [expiry('Scadenza')]
	},
	{
		id: 'spesa',
		group: 'casa',
		icon: 'cart',
		name: 'Lista della spesa',
		description: 'Cosa comprare, diviso per reparto.',
		sort: byCategory,
		categories: [
			{ emoji: '🍎', name: 'Frutta e verdura', color: 'verde' },
			{ emoji: '🧀', name: 'Latticini', color: 'giallo' },
			{ emoji: '🥩', name: 'Carne e pesce', color: 'rosso' },
			{ emoji: '🧴', name: 'Casa e igiene', color: 'acqua' },
			{ emoji: '⭐', name: 'Urgente', color: 'viola' }
		],
		fields: []
	},
	{
		id: 'medicinali',
		group: 'casa',
		icon: 'pill',
		name: 'Medicinali',
		description: 'L’armadietto dei farmaci, con le scadenze.',
		sort: byExpiry,
		categories: [
			{ emoji: '🤒', name: 'Dolore e febbre', color: 'rosso' },
			{ emoji: '🤧', name: 'Raffreddore e tosse', color: 'azzurro' },
			{ emoji: '🌿', name: 'Stomaco', color: 'verde' },
			{ emoji: '🌸', name: 'Allergie', color: 'rosa' },
			{ emoji: '🩹', name: 'Primo soccorso', color: 'pomodoro' },
			{ emoji: '💊', name: 'Integratori', color: 'ambra' }
		],
		fields: [expiry('Scadenza')],
		expiryWarningDays: 30
	},
	{
		id: 'garage',
		group: 'oggetti',
		icon: 'wrench',
		name: 'Garage e magazzino',
		description: 'Attrezzi, ricambi e scatoloni: cosa c’è e dove.',
		sort: byCategory,
		categories: [
			{ emoji: '🔧', name: 'Attrezzi', color: 'grigio' },
			{ emoji: '⚙️', name: 'Ricambi', color: 'blu' },
			{ emoji: '🌱', name: 'Giardinaggio', color: 'verde' },
			{ emoji: '🚲', name: 'Sport', color: 'arancio' },
			{ emoji: '🎄', name: 'Stagionali', color: 'rosso' },
			{ emoji: '🛠️', name: 'Da riparare', color: 'ambra' }
		],
		fields: [text('Posizione')]
	},
	{
		id: 'ufficio',
		group: 'oggetti',
		icon: 'briefcase',
		name: 'Ufficio',
		description: 'Materiale e scorte dell’ufficio o dello studio.',
		sort: byCategory,
		categories: [
			{ emoji: '✏️', name: 'Cancelleria', color: 'giallo' },
			{ emoji: '💻', name: 'Informatica', color: 'blu' },
			{ emoji: '🖨️', name: 'Consumabili', color: 'grigio' },
			{ emoji: '📁', name: 'Documenti', color: 'marrone' },
			{ emoji: '📦', name: 'Da riordinare', color: 'arancio' }
		],
		fields: [text('Posizione')]
	},
	{
		id: 'libri',
		group: 'oggetti',
		icon: 'book',
		name: 'Libri',
		description: 'La tua libreria: letti, da leggere, prestati.',
		sort: { field: 'name', direction: 'asc' },
		categories: [
			{ emoji: '📖', name: 'Romanzi', color: 'viola' },
			{ emoji: '🧠', name: 'Saggi', color: 'indaco' },
			{ emoji: '💬', name: 'Fumetti', color: 'giallo' },
			{ emoji: '🔖', name: 'Da leggere', color: 'arancio' },
			{ emoji: '🤝', name: 'In prestito', color: 'acqua' }
		],
		fields: [text('Autore'), { name: 'Letto', type: 'boolean', expiry: false, showInList: true }]
	},
	{
		id: 'cose-da-fare',
		group: 'organizzazione',
		icon: 'checklist',
		name: 'Cose da fare',
		description: 'Impegni e commissioni, con le scadenze in cima.',
		sort: byExpiry,
		categories: [
			{ emoji: '🏠', name: 'Casa', color: 'verde' },
			{ emoji: '💼', name: 'Lavoro', color: 'blu' },
			{ emoji: '🛍️', name: 'Commissioni', color: 'arancio' },
			{ emoji: '🙂', name: 'Personale', color: 'viola' },
			{ emoji: '⚡', name: 'Urgente', color: 'rosso' }
		],
		fields: [expiry('Entro il')],
		expiryWarningDays: 2
	},
	{
		id: 'vuota',
		group: 'vuota',
		icon: 'blank',
		name: 'Da zero',
		description: 'Nessuna categoria e nessun campo: decidi tutto tu.',
		sort: byDate,
		categories: [],
		fields: []
	}
];
