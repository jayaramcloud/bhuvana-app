import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run against the LOCAL files in public/ (default) so they verify the
 * source that gets pushed. Set BASE_URL to test the deployed site instead:
 *   BASE_URL=https://bhuvana.preparingforinterviews.com npx playwright test
 */
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npx --yes serve@14 public -l 4321',
        url: 'http://127.0.0.1:4321',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
