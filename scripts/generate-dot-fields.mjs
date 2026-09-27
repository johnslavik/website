import { writeFile } from 'node:fs/promises';
import { dotFieldImage } from '../src/lib/dot-pattern.ts';

for (const [name, color] of Object.entries({ black: '#171717', white: '#888', red: '#e52a24' })) {
	const image = dotFieldImage(color);
	const svg = decodeURIComponent(image.slice('url("data:image/svg+xml,'.length, -2));
	await writeFile(new URL(`../static/art/squares-${name}.svg`, import.meta.url), svg);
}
