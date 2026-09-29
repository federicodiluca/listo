/*
 * Regenerates the app icons from static/favicon.svg (the logo source of truth).
 * Run after changing the logo: `npm run icons:build`.
 *
 *   static/icons/icon-192.png       rounded logo, transparent corners ("any" purpose)
 *   static/icons/icon-512.png       same, large
 *   static/icons/maskable-512.png   full-bleed background, artwork inside the safe zone:
 *                                   Android crops it to a circle, squircle… per device
 *   static/apple-touch-icon.png     180×180 full-bleed: iOS rounds the corners itself
 *   static/og-image.png             1200×630 preview for links shared on social apps
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const logo = readFileSync(resolve(root, 'static/favicon.svg'), 'utf8');
const out = (name) => resolve(root, 'static', name);
mkdirSync(out('icons'), { recursive: true });

// The artwork is everything after the background <rect>; its fill is the brand dark
const background = logo.match(/<rect[^>]*fill="([^"]+)"/)[1];
const artwork = logo.slice(
	logo.indexOf('/>', logo.indexOf('<rect')) + 2,
	logo.lastIndexOf('</svg>')
);

/** Square SVG with a full-bleed background and the artwork scaled around the centre. */
const fullBleed = (scale) =>
	Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
			`<rect width="64" height="64" fill="${background}"/>` +
			`<g transform="translate(32 32) scale(${scale}) translate(-32 -32)">${artwork}</g></svg>`
	);

// density: rasterise the 64-unit SVG at high resolution before resizing, so edges stay sharp
const render = (svg, size) => sharp(svg, { density: 1200 }).resize(size, size).png();

await render(Buffer.from(logo), 192).toFile(out('icons/icon-192.png'));
await render(Buffer.from(logo), 512).toFile(out('icons/icon-512.png'));
// safe zone = central circle with 80% of the diameter; 0.8 keeps the tags inside it
await render(fullBleed(0.8), 512).toFile(out('icons/maskable-512.png'));
await render(fullBleed(0.9), 180).toFile(out('apple-touch-icon.png'));

// Social preview: logo, name and tagline on the brand dark. Text is rasterised here, with
// the fonts of the machine that runs the script, and the PNG is committed.
const ogImage = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<rect width="1200" height="630" fill="${background}"/>
	<g transform="translate(96 150) scale(5.2)">${logo.replace(/<\/?svg[^>]*>/g, '')}</g>
	<g font-family="Segoe UI, Helvetica, Arial, sans-serif" fill="#FFF1DE">
		<text x="480" y="270" font-size="112" font-weight="700">Listo</text>
		<text x="484" y="350" font-size="40" fill="#FF7A1A" font-weight="600">Liste con categorie multiple</text>
		<text x="484" y="420" font-size="32" opacity="0.8">Congelatore, dispensa, spesa. Gratis e offline.</text>
	</g>
</svg>`;
await sharp(Buffer.from(ogImage)).png().toFile(out('og-image.png'));

console.log('immagini aggiornate: icon-192, icon-512, maskable-512, apple-touch-icon, og-image');
