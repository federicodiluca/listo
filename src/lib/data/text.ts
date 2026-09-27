/**
 * First user-perceived character of `text`, or an empty string.
 *
 * Needed for emoji: "🥦" is 2 UTF-16 code units, and "👨‍👩‍👧" is 5 code points glued
 * together with invisible joiners. `text[0]` or `slice(0, 1)` would cut them in half;
 * Intl.Segmenter splits by grapheme, i.e. by what a person sees as one symbol.
 */
export function firstGrapheme(text: string): string {
	const segments = new Intl.Segmenter('it', { granularity: 'grapheme' }).segment(text.trim());
	return segments[Symbol.iterator]().next().value?.segment ?? '';
}

/** Trims and collapses inner whitespace; throws on an empty result. */
export function cleanName(name: string): string {
	const cleaned = name.trim().replace(/\s+/g, ' ');
	if (!cleaned) throw new Error('Il nome non può essere vuoto.');
	return cleaned;
}
