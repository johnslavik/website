import { defineConfig } from '@playwright/test';
export default defineConfig({
	testDir: './tests/browser',
	fullyParallel: true,
	retries: process.env.CI ? 1 : 0,
	use: { baseURL: 'http://127.0.0.1:8899', browserName: 'chromium', trace: 'retain-on-failure' },
	reporter: [['list'], ['html', { open: 'never' }]],
	webServer: {
		command:
			'npx wrangler dev --ip 127.0.0.1 --port 8899 --persist-to /tmp/website-invariant-tests',
		url: 'http://127.0.0.1:8899',
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	}
});
