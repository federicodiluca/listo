import { describe, expect, it } from 'vitest';
import { cleanName, firstGrapheme } from './text';

describe('firstGrapheme', () => {
	it('keeps whole emoji, including joined and flag sequences', () => {
		expect(firstGrapheme('🥦 Verdura')).toBe('🥦');
		expect(firstGrapheme('👨‍👩‍👧 famiglia')).toBe('👨‍👩‍👧');
		expect(firstGrapheme('🇮🇹')).toBe('🇮🇹');
		expect(firstGrapheme('❄️')).toBe('❄️');
	});

	it('returns an empty string for blank input', () => {
		expect(firstGrapheme('')).toBe('');
		expect(firstGrapheme('   ')).toBe('');
	});
});

describe('cleanName', () => {
	it('trims and collapses whitespace', () => {
		expect(cleanName('  Piatti   pronti ')).toBe('Piatti pronti');
	});

	it('rejects blank names', () => {
		expect(() => cleanName(' ')).toThrow();
	});
});
