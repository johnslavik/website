export function sectionNavigation(
	heroBottom: number,
	sections: { id: string; top: number }[],
	viewportHeight: number
) {
	const active =
		sections.filter((section) => section.top <= viewportHeight * 0.35).at(-1)?.id ?? 'main';
	return {
		active,
		docked: heroBottom <= 0 && active !== 'main'
	};
}
