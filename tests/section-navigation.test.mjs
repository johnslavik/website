import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sectionNavigation } from '../src/lib/section-navigation.ts';
const sections = (top) => [
	{ id: 'activity', top },
	{ id: 'talks', top: top + 1000 },
	{ id: 'contact', top: top + 2000 }
];
test('dock appears as Open Source enters, even before original nav leaves', () => {
	assert.deepEqual(sectionNavigation(10, sections(679), 800), { active: 'main', docked: true });
	assert.equal(sectionNavigation(10, sections(681), 800).docked, false);
	assert.equal(sectionNavigation(-1, sections(900), 800).docked, true);
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
