// CSS-pixel geometry shared by portrait shadows and section transitions.
// Keep SVG coordinates unscaled: changing the container must add cells, not stretch them.
export const DOT = Object.freeze({ pitch: 7, size: 3 });

export function dotNoise(column: number, row: number, seed = 0) {
	let n = Math.imul(column + 1024, 374761393) ^ Math.imul(row + seed * 97, 668265263);
	n = Math.imul(n ^ (n >>> 13), 1274126177);
	return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function shadowPaths() {
	const groups = Array.from({ length: 8 }, () => [] as string[]);
	for (let row = 0; row < 32; row++) {
		for (let column = 0; column < 32; column++) {
			if (dotNoise(column, row) > 0.8) continue;
			const x = column * DOT.pitch + (DOT.pitch - DOT.size) / 2;
			const y = row * DOT.pitch + (DOT.pitch - DOT.size) / 2;
			groups[Math.floor(dotNoise(column, row, 4) * groups.length)].push(
				`M${x} ${y}h${DOT.size}v${DOT.size}h-${DOT.size}Z`
			);
		}
	}
	return groups.map((paths, i) => ({ d: paths.join(''), opacity: 0.25 + i * 0.1 }));
}
