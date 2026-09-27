import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	DOT,
	dotViewport,
	dotExclusion,
	wholeSquareInBounds,
	shadowPaths
} from '../src/lib/dot-pattern.ts';

test('every rendered square is whole at every fractional container boundary', () => {
	const squares = shadowPaths().flatMap(({ d }) =>
		[...d.matchAll(/M([\d.]+) ([\d.]+)h([\d.]+)v([\d.]+)h-([\d.]+)Z/g)].map((m) =>
			m.slice(1).map(Number)
		)
	);
	assert.ok(squares.length > 0);
	for (const [x, y, w, h, back] of squares) {
		assert.equal(w, DOT.size);
		assert.equal(h, w);
		assert.equal(back, w);
		assert.ok((x % DOT.pitch) + w < DOT.pitch);
		assert.ok((y % DOT.pitch) + h < DOT.pitch);
	}
	for (let raw = 0; raw <= 4096; raw += 0.25) {
		const { width, height } = dotViewport(raw, raw + 0.375);
		assert.ok(width <= raw && height <= raw + 0.375);
		assert.equal(width % DOT.pitch, 0);
		assert.equal(height % DOT.pitch, 0);
		// The last repeated cell is either fully present or entirely omitted.
		const lastX = width - DOT.pitch + (DOT.pitch - DOT.size) / 2;
		if (width) assert.ok(lastX >= 0 && lastX + DOT.size <= width);
	}
	assert.deepEqual(dotViewport(NaN, Infinity), { width: 0, height: 0 });
	assert.deepEqual(shadowPaths(), shadowPaths());
});

test('opaque content excludes complete cells, never slices visible dots', () => {
	for (let x = -12.25; x < 28; x += 0.5) {
		for (let width = 0.25; width < 28; width += 0.5) {
			const box = dotExclusion(x, x + 0.125, width, width + 0.375);
			for (const key of ['x', 'y', 'width', 'height'])
				assert.equal(Math.abs(box[key] % DOT.pitch), 0);
			assert.ok(box.x <= x && box.x + box.width >= x + width);
			assert.ok(box.y <= x + 0.125 && box.y + box.height >= x + 0.125 + width + 0.375);
		}
	}
});

test('transition clipping guard includes the complete movement envelope', () => {
	assert.equal(wholeSquareInBounds(0, 3, 3, 10, 10, 3), true);
	for (const args of [
		[-0.01, 3, 3, 10, 10, 0],
		[0, 2.99, 3, 10, 10, 3],
		[7.01, 3, 3, 10, 10, 0],
		[0, 7.01, 3, 10, 10, 0],
		[0, 0, NaN, 10, 10, 0]
	])
		assert.equal(wholeSquareInBounds(...args), false);
});
