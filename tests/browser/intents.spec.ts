import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.route('**/api/activity*', (route) =>
		route.fulfill({
			json: {
				items: [
					{
						repo: 'python/cpython',
						title: 'Example contribution',
						url: 'https://github.com/python/cpython/pull/12',
						date: '2026-09-27T12:00:00Z'
					}
				],
				cached: false
			}
		})
	);
});
for (const width of [320, 390, 768, 1280, 1920]) {
	test(`layout and dot invariants at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		await expect(page.locator('.dot-surface svg').first()).toHaveAttribute('width', /[1-9]/);
		const links = page.locator('.section-index a');
		const padding = await links.evaluateAll((items) =>
			items.map((e) => getComputedStyle(e).padding)
		);
		expect(new Set(padding).size).toBe(1);
		expect(parseFloat(padding[0].split(' ')[1])).toBeGreaterThan(0);
		for (const section of ['#main', '#activity', '#talks', '#contact']) {
			await page.locator(section).scrollIntoViewIfNeeded();
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
				true
			);
		}
		const fields = await page.locator('.dot-surface').evaluateAll((items) =>
			items.map((e) => {
				const svg = e.querySelector('svg')!;
				return {
					width: Number(svg.getAttribute('width')),
					height: Number(svg.getAttribute('height')),
					viewBox: svg.getAttribute('viewBox'),
					events: getComputedStyle(e).pointerEvents,
					opacity: Number(getComputedStyle(e).opacity)
				};
			})
		);
		expect(fields.length).toBe(9);
		for (const f of fields) {
			expect(f.width % 7).toBe(0);
			expect(f.height % 7).toBe(0);
			expect(f.viewBox).toBeNull();
			expect(f.events).toBe('none');
			expect(f.opacity).toBeGreaterThan(0);
			expect(f.opacity).toBeLessThanOrEqual(0.25);
		}
		await expect(page.locator('.composition-grain').first()).toBeHidden();
		if (width <= 767) {
			await expect(page.locator('.runner-track')).toBeHidden();
			expect(await page.locator('[data-puzzle]').count()).toBe(0);
		}
	});
}
test('navigation stays hidden through the hero, emerges in Open Source, and hides on return', async ({
	page
}) => {
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/');
		const dock = page.locator('.section-dock');
		for (const progress of [0, 0.5, 0.9]) {
			await page.locator('.hero').evaluate(
				(e, progress) =>
					window.scrollTo({
						top: e.getBoundingClientRect().top + scrollY + e.clientHeight * progress,
						behavior: 'instant'
					}),
				progress
			);
			await expect(dock).toHaveAttribute('inert', '');
			await expect(dock).toHaveAttribute('aria-hidden', 'true');
			await expect
				.poll(() =>
					dock
						.locator('a')
						.first()
						.evaluate((e) => getComputedStyle(e).opacity)
				)
				.toBe('0');
		}
		await page
			.locator('#activity')
			.evaluate((e) => e.scrollIntoView({ behavior: 'instant', block: 'start' }));
		await expect(dock).not.toHaveAttribute('inert', '');
		await expect
			.poll(() =>
				dock
					.locator('a')
					.first()
					.evaluate((e) => getComputedStyle(e).opacity)
			)
			.toBe('1');
		await dock.getByRole('link', { name: 'Back to top', exact: true }).click();
		await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
		await expect.poll(() => page.evaluate(() => location.pathname + location.hash)).toBe('/');
		await expect(dock).toHaveAttribute('inert', '');
	}
});
test('content, links and all talk covers preserve the agreed intent', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.hero')).not.toContainText('nawczoraj.com');
	await expect(page.locator('.business-signoff')).toContainText('nawczoraj.com');
	await expect(page.locator('.activity-intro')).toHaveText(
		'These days, I mostly contribute to CPython and Apache Magpie.'
	);
	await expect(page.getByRole('link', { name: 'View GitHub profile', exact: true })).toBeVisible();
	await expect(page.locator('.talk-cover img')).toHaveCount(5);
	const external = await page
		.locator('a[href^="https://"]')
		.evaluateAll((items) =>
			items.map((e) => ({ target: e.getAttribute('target'), rel: e.getAttribute('rel') }))
		);
	for (const link of external) {
		expect(link.target).toBe('_blank');
		expect(link.rel).toContain('noopener');
	}
	await expect(page.getByRole('link', { name: 'Privacy policy', exact: true })).toHaveAttribute(
		'href',
		'/privacy'
	);
});
test('reduced motion suppresses the runner and keeps navigation usable', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await page.locator('#contact').scrollIntoViewIfNeeded();
	await expect(page.locator('.runner-track')).toBeHidden();
	expect(
		await page
			.locator('.section-dock a')
			.first()
			.evaluate((e) => getComputedStyle(e).transitionDuration)
	).toBe('0s');
	await expect(page.getByRole('button', { name: 'Send a message', exact: true })).toBeVisible();
});
test('contact code loads on approach and message mode stays compact', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	await expect(page.locator('#contact')).toContainText('Loading contact form');
	await page.locator('#contact').scrollIntoViewIfNeeded();
	await page.getByRole('button', { name: 'Plan a call', exact: true }).click();
	const callHeight = await page
		.locator('.contact-panel')
		.evaluate((e) => e.getBoundingClientRect().height);
	await page.getByRole('button', { name: 'Send a message', exact: true }).click();
	await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible();
	expect(
		await page.locator('.contact-panel').evaluate((e) => e.getBoundingClientRect().height)
	).toBeLessThan(callHeight);
});

// Surface presence alone did not catch the previously empty transition tails.
test('texture covers transitions and light surfaces remain perceptible', async ({ page }) => {
	await page.goto('/');
	for (const selector of ['.hero', '#activity', '#talks', '#contact', '.section-transition']) {
		const parents = page.locator(selector);
		for (const parent of await parents.all()) {
			await parent.scrollIntoViewIfNeeded();
			const layer = parent.locator(':scope > .dot-surface');
			await expect(layer).toHaveCount(1);
			await expect
				.poll(async () =>
					layer.evaluate((e) => {
						const rect = e.querySelector('svg')!.getBoundingClientRect();
						return e.parentElement!.getBoundingClientRect().height - rect.height;
					})
				)
				.toBeLessThan(7.01);
			expect(await layer.evaluate((e) => getComputedStyle(e).display)).not.toBe('none');
		}
	}
	for (const layer of await page.locator('.section-transition > .dot-surface').all()) {
		expect(await layer.evaluate((e) => Number(getComputedStyle(e).zIndex))).toBeGreaterThanOrEqual(
			0
		);
	}
	for (const selector of ['.hero > .dot-surface', '#talks > .dot-surface']) {
		expect(
			await page.locator(selector).evaluate((e) => Number(getComputedStyle(e).opacity))
		).toBeGreaterThanOrEqual(0.2);
	}
});

test('entering sections synchronizes the URL without adding history entries', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const historyLength = await page.evaluate(() => history.length);
	await page.locator('#activity').evaluate((e) =>
		window.scrollTo({
			top: e.getBoundingClientRect().top + scrollY - innerHeight * 0.8,
			behavior: 'instant'
		})
	);
	await expect(page.locator('.section-dock')).toHaveAttribute('inert', '');
	for (const id of ['activity', 'talks', 'contact']) {
		await page
			.locator(`#${id}`)
			.evaluate((e) =>
				window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' })
			);
		await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#${id}`);
		await expect(page.locator(`.section-dock a[href="#${id}"]`)).toHaveAttribute(
			'aria-current',
			'location'
		);
	}
	expect(await page.evaluate(() => history.length)).toBe(historyLength);
});

test('every dock block remains unobscured above every section', async ({ page }) => {
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/');
		for (const id of ['activity', 'talks', 'contact']) {
			await page.locator(`#${id}`).evaluate((e) =>
				window.scrollTo({
					top: e.getBoundingClientRect().top + scrollY - 60,
					behavior: 'instant'
				})
			);
			const dock = page.locator('.section-dock');
			await expect(dock).not.toHaveAttribute('inert', '');
			for (const link of await dock.locator('a').all()) {
				await expect
					.poll(() =>
						link.evaluate((e) => {
							const r = e.getBoundingClientRect();
							const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
							return hit === e || e.contains(hit);
						})
					)
					.toBe(true);
			}
		}
	}
});

for (const id of ['activity', 'talks', 'contact']) {
	test(`direct ${id} link retains its destination on initial load`, async ({ page }) => {
		await page.goto(`/#${id}`);
		await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#${id}`);
		await expect
			.poll(() => page.locator(`#${id}`).evaluate((e) => Math.abs(e.getBoundingClientRect().top)))
			.toBeLessThan(150);
	});
}
