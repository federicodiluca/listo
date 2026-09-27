/**
 * Category colors. Records store the *name* (e.g. `"verde"`), never the hex value:
 * the palette can then be retuned, or adapted to dark mode, without touching the data.
 * Each value is mid-lightness so it reads on both light and dark backgrounds.
 */
export const palette = {
	rosso: { label: 'Rosso', value: '#E5484D' },
	pomodoro: { label: 'Pomodoro', value: '#F0643A' },
	arancio: { label: 'Arancio', value: '#FF8B1F' },
	ambra: { label: 'Ambra', value: '#F5B400' },
	giallo: { label: 'Giallo', value: '#E6CF2E' },
	lime: { label: 'Lime', value: '#9BC53D' },
	verde: { label: 'Verde', value: '#3FAE5A' },
	smeraldo: { label: 'Smeraldo', value: '#1FA387' },
	acqua: { label: 'Acqua', value: '#1AA7B8' },
	azzurro: { label: 'Azzurro', value: '#3E9BE9' },
	blu: { label: 'Blu', value: '#4A6CF0' },
	indaco: { label: 'Indaco', value: '#6E5AE6' },
	viola: { label: 'Viola', value: '#9B59D6' },
	rosa: { label: 'Rosa', value: '#E0569B' },
	marrone: { label: 'Marrone', value: '#A0714F' },
	grigio: { label: 'Grigio', value: '#8B8D98' }
} as const;

export type ColorName = keyof typeof palette;

export const colorNames = Object.keys(palette) as ColorName[];

export function isColorName(value: string): value is ColorName {
	return value in palette;
}

/** Falls back to grey for unknown names (e.g. data written by a newer version). */
export function colorValue(name: string): string {
	return isColorName(name) ? palette[name].value : palette.grigio.value;
}
