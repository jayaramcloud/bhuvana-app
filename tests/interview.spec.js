import { test, expect } from '@playwright/test';

/**
 * Interview Qstns: top-level tabs, Technical subtabs, and content counts.
 */

const SUBTABS = [
  { id: 'playwright', label: 'Playwright', items: 55, code: 33 },
  { id: 'selenium', label: 'Selenium', items: 69, code: 27 },
  { id: 'sql', label: 'SQL', items: 42, code: 17 },
  { id: 'postman', label: 'Postman', items: 57, code: 13 },
  { id: 'cypress', label: 'Cypress', items: 60, code: 34 },
  { id: 'appium', label: 'Appium', items: 50, code: 6 },
];

test.describe('Interview tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#interview');
  });

  test('shows exactly Technical and Behavioral (Coding removed)', async ({ page }) => {
    const tabs = await page.locator('.tab-btn').allTextContents();
    expect(tabs.map((t) => t.trim())).toEqual(['Technical', 'Behavioral']);
    await expect(page.locator('.tab-btn[data-tab="coding"]')).toHaveCount(0);
    await expect(page.locator('.tab-pane[data-pane="coding"]')).toHaveCount(0);
  });

  test('Technical is active by default', async ({ page }) => {
    await expect(page.locator('.tab-btn.active')).toHaveText('Technical');
    await expect(page.locator('.tab-pane.active')).toHaveAttribute('data-pane', 'technical');
  });

  test('only one tab pane is visible at a time', async ({ page }) => {
    await expect(page.locator('.tab-pane')).toHaveCount(2);
    await expect(page.locator('.tab-pane.active')).toHaveCount(1);
  });

  test('switching to Behavioral hides the Technical pane', async ({ page }) => {
    await page.locator('.tab-btn[data-tab="behavioral"]').click();
    await expect(page.locator('.tab-pane[data-pane="behavioral"]')).toBeVisible();
    await expect(page.locator('.tab-pane[data-pane="technical"]')).toBeHidden();
    await expect(page.locator('.tab-btn.active')).toHaveText('Behavioral');
  });

  test('switching back to Technical restores its pane', async ({ page }) => {
    await page.locator('.tab-btn[data-tab="behavioral"]').click();
    await page.locator('.tab-btn[data-tab="technical"]').click();
    await expect(page.locator('.tab-pane[data-pane="technical"]')).toBeVisible();
    await expect(page.locator('.tab-btn.active')).toHaveText('Technical');
  });
});

test.describe('Technical subtabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#interview');
  });

  test('all six tool subtabs render in order', async ({ page }) => {
    const labels = await page.locator('.subtab-btn').allTextContents();
    expect(labels.map((s) => s.trim())).toEqual(SUBTABS.map((s) => s.label));
  });

  test('exactly one subtab pane is visible at a time', async ({ page }) => {
    await expect(page.locator('.subtab-pane')).toHaveCount(6);
    await expect(page.locator('.subtab-pane.active')).toHaveCount(1);
  });

  for (const { id, label, items, code } of SUBTABS) {
    test(`${label} subtab: ${items} questions and ${code} code blocks`, async ({ page }) => {
      await page.locator(`.subtab-btn[data-subtab="${id}"]`).click();

      const pane = page.locator(`.subtab-pane[data-subpane="${id}"]`);
      await expect(pane).toBeVisible();
      await expect(page.locator('.subtab-btn.active')).toHaveText(label);

      await expect(pane.locator('.qa-item')).toHaveCount(items);
      await expect(pane.locator('.qa-code')).toHaveCount(code);
    });
  }

  test('every question has an answer body', async ({ page }) => {
    for (const { id } of SUBTABS) {
      await page.locator(`.subtab-btn[data-subtab="${id}"]`).click();
      const pane = page.locator(`.subtab-pane[data-subpane="${id}"]`);
      const questions = await pane.locator('.qa-q').count();
      const answers = await pane.locator('.qa-a, .qa-code, .qa-table').count();
      expect(answers, `${id}: answers should not be fewer than questions`).toBeGreaterThanOrEqual(questions);
    }
  });

  test('Playwright subtab shows the documented heading and groups', async ({ page }) => {
    await page.locator('.subtab-btn[data-subtab="playwright"]').click();
    const pane = page.locator('.subtab-pane[data-subpane="playwright"]');
    await expect(pane.locator('h2')).toHaveText('Playwright Interview Questions and Answers');
    await expect(pane.locator('.qa-group')).toHaveCount(7);
  });

  test('SQL subtab has its 5 groups and a closing footnote', async ({ page }) => {
    await page.locator('.subtab-btn[data-subtab="sql"]').click();
    const pane = page.locator('.subtab-pane[data-subpane="sql"]');
    await expect(pane.locator('h2')).toHaveText('SQL Interview Questions and Answers');
    await expect(pane.locator('.qa-group')).toHaveCount(5);
    await expect(pane.locator('.qa-footnote')).toBeVisible();
  });

  test('Selenium subtab renders its 4 comparison tables', async ({ page }) => {
    await page.locator('.subtab-btn[data-subtab="selenium"]').click();
    const pane = page.locator('.subtab-pane[data-subpane="selenium"]');
    await expect(pane.locator('.qa-table')).toHaveCount(4);
  });

  test('Appium subtab links to the Appium docs', async ({ page }) => {
    await page.locator('.subtab-btn[data-subtab="appium"]').click();
    const pane = page.locator('.subtab-pane[data-subpane="appium"]');
    await expect(pane.locator('a[href^="https://appium.io"]')).toHaveCount(7);
  });
});

test.describe('Behavioral tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#interview');
    await page.locator('.tab-btn[data-tab="behavioral"]').click();
  });

  test('shows 30 questions with 6 group headings', async ({ page }) => {
    const pane = page.locator('.tab-pane[data-pane="behavioral"]');
    await expect(pane.locator('.qa-item')).toHaveCount(30);
    await expect(pane.locator('.qa-group')).toHaveCount(6);
  });

  test('heading and STAR note are present', async ({ page }) => {
    const pane = page.locator('.tab-pane[data-pane="behavioral"]');
    await expect(pane.locator('h2')).toHaveText('Behavioral Interview Questions for a Software Tester');
    await expect(pane.locator('.qa-note')).toContainText('STAR');
  });

  test('includes the Quick Answer Tips list', async ({ page }) => {
    const pane = page.locator('.tab-pane[data-pane="behavioral"]');
    await expect(pane.locator('.qa-group', { hasText: 'Quick Answer Tips' })).toBeVisible();
  });
});
