import { test, expect } from '@playwright/test';

/**
 * Content quality: the site's text was converted from markdown, so these tests
 * guard against broken conversion (unescaped HTML entities, leftover markdown
 * syntax, raw placeholders).
 */

const PAGES = ['home', 'certifications', 'interview', 'about', 'contact'];

test.describe('No broken content conversion', () => {
  for (const id of PAGES) {
    test(`${id}: no unescaped entities or leftover markdown`, async ({ page }) => {
      await page.goto(`/#${id}`);
      const text = await page.locator(`#${id}`).innerText();

      // Raw HTML entity artefacts that should have been decoded
      for (const artefact of ['&rsquo;', '&amp;', '&lt;', '&gt;', '&quot;', '&ldquo;', '&rdquo;', '&mdash;']) {
        expect(text, `${id} contains unescaped ${artefact}`).not.toContain(artefact);
      }

      // Leftover markdown syntax
      expect(text, `${id} has leftover ** bold markers`).not.toMatch(/\*\*/);
      expect(text, `${id} has leftover markdown links`).not.toMatch(/\]\(https?:\/\//);

      // Placeholder text
      expect(text, `${id} contains lorem ipsum`).not.toMatch(/lorem ipsum/i);
      expect(text, `${id} contains TODO`).not.toMatch(/\bTODO\b/);
    });
  }

  test('every rendered link has non-empty text and a real href', async ({ page }) => {
    await page.goto('/');
    for (const id of PAGES) {
      await page.locator(`.nav-btn[data-target="${id}"]`).click();
      const links = page.locator(`#${id} a`);
      const count = await links.count();
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const text = (await link.innerText()).trim();
        const href = await link.getAttribute('href');
        expect(text.length, `empty link text in #${id}`).toBeGreaterThan(0);
        expect(href, `empty href in #${id}`).toBeTruthy();
        expect(href, `placeholder href in #${id}`).not.toBe('#');
      }
    }
  });

  test('no image is broken on any page', async ({ page }) => {
    await page.goto('/');
    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src')),
    );
    expect(broken).toEqual([]);
  });

  test('no element overflows the viewport horizontally on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    for (const id of PAGES) {
      await page.locator(`.nav-btn[data-target="${id}"]`).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `#${id} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('Responsive layout', () => {
  const MOBILE = { width: 375, height: 812 };

  test('mobile: sidebar becomes a top bar and stays usable', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');

    // sidebar is no longer fixed to the left
    await expect(page.locator('.sidebar')).toHaveCSS('position', 'static');

    // nav still works on mobile
    await page.locator('.nav-btn[data-target="contact"]').click();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('mobile: logo shrinks so it does not cover the nav bar', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
    const logo = page.locator('.home-logo');
    await expect(logo).toHaveCSS('position', 'static');
    await expect(logo).toHaveCSS('width', '120px');
  });

  test('mobile: no horizontal overflow on any page', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
    for (const id of PAGES) {
      await page.locator(`.nav-btn[data-target="${id}"]`).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `#${id} overflows on mobile by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });

  test('mobile: long subtab content does not overflow', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/#interview');
    await page.locator('.subtab-btn[data-subtab="selenium"]').click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('desktop: logo is pinned and content is offset for the sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.locator('.sidebar')).toHaveCSS('position', 'fixed');
    await expect(page.locator('.home-logo')).toHaveCSS('position', 'fixed');
    await expect(page.locator('.content')).toHaveCSS('margin-left', '220px');
  });
});

test.describe('Accessibility basics', () => {
  test('document has a language and a non-empty title', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('html').getAttribute('lang')).toBeTruthy();
    expect((await page.title()).trim().length).toBeGreaterThan(0);
  });

  test('the navigation landmark is labelled', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav.sidebar');
    await expect(nav).toHaveAttribute('aria-label', /navigation/i);
  });

  test('every page has exactly one h1', async ({ page }) => {
    await page.goto('/');
    for (const id of PAGES) {
      await page.locator(`.nav-btn[data-target="${id}"]`).click();
      await expect(page.locator(`#${id} h1`), `#${id} h1 count`).toHaveCount(1);
    }
  });

  test('the QA logo has meaningful alt text', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.home-logo')).toHaveAttribute('alt', /quality assurance/i);
  });

  test('tab bars expose the tablist role', async ({ page }) => {
    await page.goto('/#interview');
    const bars = page.locator('[role="tablist"]');
    expect(await bars.count()).toBeGreaterThanOrEqual(2);
  });

  test('keyboard focus reaches and activates a nav button', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-btn[data-target="certifications"]').focus();
    await expect(page.locator('.nav-btn[data-target="certifications"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#certifications')).toBeVisible();
  });

  test('external links use rel=noopener when opening a new tab', async ({ page }) => {
    await page.goto('/#certifications');
    const newTabLinks = page.locator('a[target="_blank"]');
    const n = await newTabLinks.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const rel = await newTabLinks.nth(i).getAttribute('rel');
      expect(rel, 'target=_blank without noopener').toContain('noopener');
    }
  });
});
