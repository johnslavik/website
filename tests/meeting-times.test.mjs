import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meetingTimes, isMeetingTime } from '../src/lib/meeting-times.ts';
test('daytime meeting slots are half-hourly and finish by 17:00', () => {
	assert.equal(meetingTimes.length, 16);
	assert.equal(meetingTimes[0], '09:00');
	assert.equal(meetingTimes.at(-1), '16:30');
});
test('meeting hours follow visitor timezone, including daylight saving', () => {
	assert.equal(isMeetingTime('2026-09-22T07:00:00Z', 'Europe/Warsaw'), true);
	assert.equal(isMeetingTime('2026-12-22T08:30:00Z', 'Europe/Warsaw'), true);
	assert.equal(isMeetingTime('2026-09-22T07:00:00Z', 'America/New_York'), false);
});
test('rejects night hours and arbitrary minutes', () => {
	for (const time of ['02:00', '09:17', '17:00'])
		assert.equal(isMeetingTime(`2026-09-22T${time}:00Z`, 'UTC'), false);
	assert.equal(isMeetingTime('2026-09-22T09:30:01Z', 'UTC'), false);
});
