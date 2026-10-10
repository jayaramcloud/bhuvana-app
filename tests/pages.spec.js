import { test, expect } from '@playwright/test';

/**
 * Per-page content: Home, Certifications, About Us, Contact Us.
 */

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the "Welcome !" heading', async ({ page }) => {
    await expect(page.locator('#home h1')).toHaveText('Welcome !');
  });

  test('shows the interview-prep intro paragraph', async ({ page }) => {
    const intro = page.locator('#home .home-intro');
    await expect(intro).toBeVisible();
    await expect(intro).toContainText('prepare for interviews with confidence');
    await expect(intro).toContainText('dream job');
  });

  test('intro paragraph renders at 20px', async ({ page }) => {
    await expect(page.locator('#home .home-intro')).toHaveCSS('font-size', '20px');
  });

  test('QA logo is present, loads, and is pinned top-right', async ({ page }) => {
    const logo = page.locator('.home-logo');
    await expect(logo).toBeVisible();

    // image actually decoded (naturalWidth > 0 means the file loaded)
    const loaded = await logo.evaluate((img) => img.complete && img.naturalWidth > 0);
    expect(loaded).toBe(true);

    await expect(logo).toHaveCSS('position', 'fixed');
    await expect(logo).toHaveCSS('width', '240px');
  });

  test('heading uses the blue theme colour', async ({ page }) => {
    await expect(page.locator('#home h1')).toHaveCSS('color', 'rgb(30, 58, 138)');
  });

  test('removed demo content is gone', async ({ page }) => {
    await expect(page.locator('#home')).not.toContainText('Click me');
    await expect(page.locator('#home')).not.toContainText('Try it');
    await expect(page.locator('#greet')).toHaveCount(0);
  });
});

test.describe('Certifications page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#certifications');
  });

  test('heading is "Software Tester Certifications"', async ({ page }) => {
    await expect(page.locator('#certifications h1')).toHaveText('Software Tester Certifications');
  });

  test('comparison table has the right headers and 9 certification rows', async ({ page }) => {
    const table = page.locator('#certifications .qa-table');
    await expect(table).toBeVisible();

    const headers = await table.locator('th').allTextContents();
    expect(headers.map((h) => h.trim())).toEqual(['Certification', 'Best suited for', 'What it covers']);

    await expect(table.locator('tbody tr')).toHaveCount(9);
  });

  test('lists all expected certifications', async ({ page }) => {
    const body = page.locator('#certifications .qa-table tbody');
    for (const code of ['CTFL', 'CTAL-TA', 'CTAL-TAE', 'CT-MAT', 'CT-PT', 'CT-SEC', 'CT-AT', 'CT-AI', 'CSTE']) {
      await expect(body).toContainText(code);
    }
  });

  test('"A practical path" section has 4 bullets', async ({ page }) => {
    await expect(page.locator('#certifications .cert-heading')).toHaveText('A practical path');
    await expect(page.locator('#certifications ul.qa-a li')).toHaveCount(4);
  });

  test('external links are present and safe', async ({ page }) => {
    const links = page.locator('#certifications a[href^="http"]');
    await expect(links).toHaveCount(3);
    for (const href of await links.evaluateAll((els) => els.map((e) => e.href))) {
      expect(href).toMatch(/^https:\/\/(www\.istqb\.org|qaiusa\.com)\//);
    }
    await expect(page.locator('#certifications a[target="_blank"][rel*="noopener"]')).toHaveCount(3);
  });
});

test.describe('About Us page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#about');
  });

  test('heading is "About Us"', async ({ page }) => {
    await expect(page.locator('#about h1')).toHaveText('About Us');
  });

  test('contains the three team paragraphs', async ({ page }) => {
    const paras = page.locator('#about p');
    await expect(paras).toHaveCount(3);
    await expect(paras.nth(0)).toContainText('team of learners and professionals');
    await expect(paras.nth(1)).toContainText('starting your career');
    await expect(paras.nth(2)).toContainText('Your dream job starts with preparation');
  });

  test('old placeholder text is gone', async ({ page }) => {
    await expect(page.locator('#about')).not.toContainText('small team that loves building');
    await expect(page.locator('#about')).not.toContainText('Hermes Agent');
  });
});

test.describe('Contact Us page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
  });

  test('heading and intro are correct', async ({ page }) => {
    await expect(page.locator('#contact h1')).toHaveText('Contact Us');
    await expect(page.locator('#contact')).toContainText('We would love to hear from you.');
  });

  test('shows the London, ON address', async ({ page }) => {
    await expect(page.locator('#contact')).toContainText('12345, Waffle Street, London, ON');
  });

  test('email link is a valid mailto', async ({ page }) => {
    const mail = page.locator('#contact a[href^="mailto:"]');
    await expect(mail).toHaveCount(1);
    await expect(mail).toHaveAttribute('href', 'mailto:hello@example.com');
  });
});
