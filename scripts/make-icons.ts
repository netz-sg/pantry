import fs from 'node:fs/promises';
import sharp from 'sharp';

/** Erzeugt alle App-Symbole aus public/icons/icon.svg. */
const svg = await fs.readFile('public/icons/icon.svg');
for (const size of [192, 512])
  await sharp(svg).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
await sharp(svg).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png');
await sharp(svg)
  .resize(512, 512)
  .extend({ top: 0, bottom: 0, left: 0, right: 0 })
  .png()
  .toFile('public/icons/maskable-512.png');
await sharp(svg).resize(48, 48).png().toFile('src/app/icon.png');
console.log('Symbole erzeugt');
