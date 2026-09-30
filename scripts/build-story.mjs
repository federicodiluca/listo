/*
 * Regenerates the image to share in Instagram stories (1080×1920): `npm run story:build`.
 * The PNG is committed, like og-image.png, so the build doesn't need to redo it.
 *
 * It shows the app with a made-up freezer list, the one Listo was born from. The link is
 * written large because Instagram only takes the image from a share. Anything important
 * stays between y 250 and y 1670: stories cover the top and bottom with their own UI.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logo = readFileSync(resolve(root, 'static/favicon.svg'), 'utf8');

const DARK = '#17151A';
const DARK_LIGHT = '#2a2630';
const CREAM = '#FFF1DE';
const ORANGE = '#FF7A1A';
const INK = '#17151A';
const MUTED = '#6f6878';

// Category chips, in the colours of the app palette (no emoji: librsvg may lack the font)
const CHIPS = {
	verdura: { label: 'Verdura', fill: '#e3f4e1', ink: '#2f7a2a' },
	pronti: { label: 'Piatti pronti', fill: '#ffe7d3', ink: '#b8520b' },
	carne: { label: 'Carne', fill: '#fde2e0', ink: '#b3261e' },
	pesce: { label: 'Pesce', fill: '#dff0fb', ink: '#1f6e9e' },
	dolci: { label: 'Dolci e gelati', fill: '#fbe3f0', ink: '#a02a6c' }
};

const items = [
	{ name: 'Minestrone', chips: ['verdura', 'pronti'], expiry: 'scade tra 5 giorni', soon: true },
	{ name: 'Ragù della nonna', chips: ['carne', 'pronti'], expiry: 'scade tra 3 settimane' },
	{ name: 'Filetti di merluzzo', chips: ['pesce'], expiry: 'scade tra 2 mesi' },
	{ name: 'Piselli', chips: ['verdura'], expiry: 'scade tra 4 mesi' },
	{ name: 'Gelato al pistacchio', chips: ['dolci'], expiry: 'scade tra 6 mesi' }
];

const font = `'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;

const PX = 140;
const PW = 1080 - PX * 2;
const rows = items
	.map((item, i) => {
		const y = 990 + i * 118;
		let x = 32;
		const chips = item.chips
			.map((c) => {
				const text = CHIPS[c].label;
				const w = Math.round(text.length * 11.5) + 32;
				const chip = `<rect x="${x}" y="54" width="${w}" height="38" rx="19" fill="${CHIPS[c].fill}"/>
					<text x="${x + 16}" y="81" font-size="22" font-weight="600" fill="${CHIPS[c].ink}">${text}</text>`;
				x += w + 10;
				return chip;
			})
			.join('');
		return `
		<g transform="translate(${PX + 36} ${y})">
			<rect width="${PW - 72}" height="104" rx="18" fill="#ffffff"/>
			<text x="32" y="40" font-size="30" font-weight="600" fill="${INK}">${item.name}</text>
			${chips}
			<text x="${PW - 104}" y="40" font-size="22" font-weight="${item.soon ? 700 : 400}" fill="${item.soon ? ORANGE : MUTED}" text-anchor="end">${item.expiry}</text>
		</g>`;
	})
	.join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="${DARK_LIGHT}"/>
			<stop offset="1" stop-color="${DARK}"/>
		</linearGradient>
		<filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
			<feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#000" flood-opacity="0.45"/>
		</filter>
	</defs>
	<rect width="1080" height="1920" fill="url(#bg)"/>
	<g transform="translate(428 240) scale(3.5)">${logo.replace(/<\/?svg[^>]*>/g, '')}</g>

	<g font-family="${font}">
		<text x="540" y="580" font-size="112" font-weight="700" fill="${CREAM}" text-anchor="middle">Listo</text>
		<text x="540" y="655" font-size="44" font-weight="600" fill="${ORANGE}" text-anchor="middle">Il minestrone sta sia in “verdura”</text>
		<text x="540" y="712" font-size="44" font-weight="600" fill="${ORANGE}" text-anchor="middle">sia in “piatti pronti”</text>

		<g filter="url(#shadow)">
			<rect x="${PX}" y="790" width="${PW}" height="806" rx="44" fill="#faf7f2"/>
		</g>
		<text x="${PX + 48}" y="864" font-size="30" fill="${MUTED}">Congelatore</text>
		<text x="${PX + 48}" y="936" font-size="56" font-weight="700" fill="${INK}">14 cose, 1 in scadenza</text>
		${rows}

		<text x="540" y="1638" font-size="34" fill="${CREAM}" opacity="0.8" text-anchor="middle">Liste con categorie multiple. Gratis e offline.</text>
		<text x="540" y="1702" font-size="46" font-weight="700" fill="${ORANGE}" text-anchor="middle">listo.federicodiluca.com</text>
	</g>
</svg>`;

await sharp(Buffer.from(svg))
	.png({ compressionLevel: 9, palette: true })
	.toFile(resolve(root, 'static/story.png'));
console.log('static/story.png aggiornata');
