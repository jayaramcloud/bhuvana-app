import { test, expect } from '@playwright/test';

/**
 * Regression: browser back/forward and in-page hash links must switch sections.
 * Previously showSection() used history.replaceState() with no hashchange
 * listener, so only full page loads and button clicks worked.
 */

test('changing the hash while the page is open switches section', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { location.hash = '#contact'; });
  await expect(page.locator('#contact')).toBeVisible();
  await expect(page.locator('.nav-btn.active')).toHaveText('Contact Us');
});

test('browser Back returns to the previous section', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-btn[data-target="certifications"]').click();
  await expect(page.locator('#certifications')).toBeVisible();

  await page.goBack();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('.nav-btn.active')).toHaveText('Home');
});

test('browser Forward re-advances to the next section', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-btn[data-target="about"]').click();
  await expect(page.locator('#about')).toBeVisible();

  await page.goBack();
  await expect(page.locator('#home')).toBeVisible();

  await page.goForward();
  await expect(page.locator('#about')).toBeVisible();
});

test('navigating with only a hash change does not reload the page', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { window.__notReloaded = true; });
  await page.locator('.nav-btn[data-target="contact"]').click();
  await expect(page.locator('#contact')).toBeVisible();
  // marker survives => no full reload
  expect(await page.evaluate(() => window.__notReloaded === true)).toBe(true);
});
