import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

// Une seule source graphique : le logo utilisé dans l'en-tête du site.
const publicDir = new URL('../public/', import.meta.url);
const logo = readFileSync(new URL('logo.svg', publicDir), 'utf8');
for (const [name, size, background] of [
  ['mibeko-icon-48.png', 48, undefined],
  ['apple-touch-icon.png', 180, '#fcf9f8'],
]) {
  const png = new Resvg(logo, {
    fitTo: { mode: 'width', value: size },
    background,
  }).render().asPng();
  writeFileSync(new URL(name, publicDir), png);
  console.log(`${name} : ${size} × ${size}`);
}
