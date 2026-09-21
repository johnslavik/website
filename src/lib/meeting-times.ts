export const meetingTimes = Array.from(
	{ length: 16 },
	(_, index) => `${String(9 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`
);
export function isMeetingTime(start: string, timeZone: string): boolean {
	const date = new Date(start);
	if (!Number.isFinite(date.getTime())) return false;
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(date);
	const part = (type: string) => parts.find((p) => p.type === type)?.value;
	return (
		meetingTimes.includes(`${part('hour')}:${part('minute')}`) &&
		part('second') === '00' &&
		date.getUTCMilliseconds() === 0
	);
}
