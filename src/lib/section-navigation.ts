export function sectionNavigation(
	anchorTop: number,
	sections: { id: string; top: number }[],
	viewportHeight: number
) {
	const active =
		sections.filter((section) => section.top <= viewportHeight * 0.35).at(-1)?.id ?? 'main';
	return {
		active,
		docked: anchorTop <= 0 || (sections[0]?.top ?? Infinity) < viewportHeight * 0.85
	};
}
