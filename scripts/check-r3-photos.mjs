import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync('src/data/products.ts', 'utf8');
const filenames = [
  'karkasnaya-5-5.webp',
  'kvadro-2x2.webp',
  'kvadro-3x2.webp',
  'kvadro-4x2.webp',
];
for (const filename of filenames) {
  const importPath = `../assets/img/${filename}`;
  if (!source.includes(importPath)) throw new Error(`Missing sauna photo import ${filename}`);
  const file = join('src/assets/img', filename);
  const size = statSync(file).size;
  if (size < 10000 || size > 450000) throw new Error(`${filename}: unexpected file size ${size}`);
  const magic = readFileSync(file).subarray(0, 12);
  if (magic.toString('ascii', 0, 4) !== 'RIFF' || magic.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`${filename}: invalid WebP header`);
  }
  console.log(`${filename}: valid WebP (${size} bytes)`);
}
console.log('Four sauna photos: PASS');
