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

// Fixed-size CSS background for the remaining section decorations. All variants
// share geometry; only their ink changes. Never size these backgrounds to a container.
export const DOT_FIELD = Object.freeze({ width: DOT.pitch * 92, height: DOT.pitch * 40 });
export function dotFieldImage(color: string) {
	const paths: string[] = [];
	for (let row = 0; row < 40; row++) {
		for (let column = 0; column < 92; column++) {
			if (dotNoise(column, row) > 0.8) continue;
			const x = column * DOT.pitch + (DOT.pitch - DOT.size) / 2;
			const y = row * DOT.pitch + (DOT.pitch - DOT.size) / 2;
			const opacity = (0.25 + dotNoise(column, row, 4) * 0.7) * (1 - column / 92) * (1 - row / 40);
			paths.push(
				`<path d="M${x} ${y}h${DOT.size}v${DOT.size}h-${DOT.size}Z" opacity="${opacity.toFixed(3)}"/>`
			);
		}
	}
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${DOT_FIELD.width}" height="${DOT_FIELD.height}"><g fill="${color}">${paths.join('')}</g></svg>`;
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Crop only at cell boundaries, in the gap after a complete square.
export function dotViewport(width: number, height: number) {
	const snap = (value: number) =>
		Number.isFinite(value) ? Math.max(0, Math.floor(value / DOT.pitch) * DOT.pitch) : 0;
	return { width: snap(width), height: snap(height) };
}

export function dotExclusion(x: number, y: number, width: number, height: number) {
	const left = Math.floor(x / DOT.pitch) * DOT.pitch;
	const top = Math.floor(y / DOT.pitch) * DOT.pitch;
	return {
		x: left,
		y: top,
		width: Math.ceil((x + width) / DOT.pitch) * DOT.pitch - left,
		height: Math.ceil((y + height) / DOT.pitch) * DOT.pitch - top
	};
}

export function wholeSquareInBounds(
	x: number,
	y: number,
	size: number,
	width: number,
	height: number,
	upwardTravel = 0
) {
	return (
		[x, y, size, width, height, upwardTravel].every(Number.isFinite) &&
		size > 0 &&
		upwardTravel >= 0 &&
		x >= 0 &&
		y - upwardTravel >= 0 &&
		x + size <= width &&
		y + size <= height
	);
}
