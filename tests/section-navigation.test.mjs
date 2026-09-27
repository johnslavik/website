import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionNavigation } from '../src/lib/section-navigation.ts';
const sections = (top) => [
	{ id: 'activity', top },
	{ id: 'talks', top: top + 1000 },
	{ id: 'contact', top: top + 2000 }
];
test('dock stays hidden in the hero and emerges only in the Open Source reading region', () => {
	for (const top of [900, 679, 300, 281]) {
		assert.equal(sectionNavigation(-1, sections(top), 800).docked, false);
	}
	assert.equal(sectionNavigation(10, sections(280), 800).docked, false);
	assert.deepEqual(sectionNavigation(-1, sections(280), 800), { active: 'activity', docked: true });
	assert.equal(sectionNavigation(-1, sections(0), 800).docked, true);
});
test('active anchor follows the reading region in either scrolling direction', () => {
	for (const [top, active] of [
		[300, 'main'],
		[280, 'activity'],
		[-720, 'talks'],
		[-1720, 'contact'],
		[0, 'activity'],
		[900, 'main']
	])
		assert.equal(sectionNavigation(1, sections(top), 800).active, active);
});
