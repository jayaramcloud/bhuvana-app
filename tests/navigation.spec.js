import { test, expect } from '@playwright/test';

/**
 * Site-wide: navigation, page switching, and panel visibility.
 */

const NAV = [
  { target: 'home', label: 'Home' },
  { target: 'certifications', label: 'Certifications' },
  { target: 'interview', label: 'Interview Qstns' },
  { target: 'about', label: 'About Us' },
  { target: 'contact', label: 'Contact Us' },
];

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sidebar renders every expected nav button, in order', async ({ page }) => {
    const labels = await page.locator('.sidebar .nav-btn').allTextContents();
    expect(labels.map((s) => s.trim())).toEqual(NAV.map((n) => n.label));
  });

  test('"What We Do" tab is not present', async ({ page }) => {
    await expect(page.locator('.nav-btn', { hasText: 'What We Do' })).toHaveCount(0);
    await expect(page.locator('#services')).toHaveCount(0);
  });

  test('Home is the default active page on load', async ({ page }) => {
    await expect(page.locator('.nav-btn.active')).toHaveText('Home');
    await expect(page.locator('#home')).toBeVisible();
  });

  test('exactly one panel is visible at a time', async ({ page }) => {
    await expect(page.locator('.panel.active')).toHaveCount(1);
    await expect(page.locator('.panel')).toHaveCount(5);
  });

  for (const { target, label } of NAV) {
    test(`clicking "${label}" shows only the ${target} panel`, async ({ page }) => {
      await page.locator(`.nav-btn[data-target="${target}"]`).click();
      await expect(page.locator(`#${target}`)).toBeVisible();
      await expect(page.locator('.panel.active')).toHaveCount(1);
      await expect(page.locator('.nav-btn.active')).toHaveText(label);
    });
  }

  test('deep link via URL hash opens the matching section', async ({ page }) => {
    await page.goto('/#contact');
    await expect(page.locator('#contact')).toBeVisible();
    await expect(page.locator('.nav-btn.active')).toHaveText('Contact Us');
  });

  test('unknown hash falls back to Home', async ({ page }) => {
    await page.goto('/#does-not-exist');
    await expect(page.locator('#home')).toBeVisible();
  });
});

test.describe('Sidebar styling', () => {
  test('sidebar is light blue and nav buttons are bold', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toHaveCSS('background-color', 'rgb(219, 234, 254)');

    const btn = page.locator('.nav-btn').first();
    await expect(btn).toHaveCSS('font-weight', '700');
  });

  test('active nav button uses the blue highlight', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-btn.active')).toHaveCSS('background-color', 'rgb(59, 130, 246)');
  });
});
