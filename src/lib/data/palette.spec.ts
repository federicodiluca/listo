import { describe, expect, it } from 'vitest';
import { colorNames, colorValue, nextColor, palette } from './palette';

describe('palette', () => {
	it('has 16 distinct colors', () => {
		expect(colorNames).toHaveLength(16);
		expect(new Set(colorNames.map((c) => palette[c].value)).size).toBe(16);
	});

	it('suggests the first unused color, then cycles', () => {
		expect(nextColor([])).toBe('rosso');
		expect(nextColor(['rosso', 'pomodoro'])).toBe('arancio');
		expect(nextColor(colorNames)).toBe('rosso');
	});

	it('falls back to grey for unknown names', () => {
		expect(colorValue('fucsia-neon')).toBe(palette.grigio.value);
	});
});
