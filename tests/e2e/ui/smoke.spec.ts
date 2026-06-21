import { test, expect } from '@playwright/test';
import { attachDiagnostics } from '../helpers';

test.describe('home page smoke', () => {
  test('loads with no console errors and no failed page resources', async ({ page }) => {
    const { consoleErrors, badResponses } = attachDiagnostics(page);

    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Microsoft Partner/i);

    // Exercise the interactive client code (theme store + scroll-spy) so any
    // runtime exception surfaces as a console/page error.
    await page.locator('.theme-toggle').click();
    await page.mouse.wheel(0, 2400);
    await page.waitForTimeout(300);

    expect(consoleErrors, `console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
    expect(badResponses, `failed responses:\n${badResponses.join('\n')}`).toEqual([]);
  });

  test('renders the hero, every category section, and link cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.hero h1')).toBeVisible();
    await expect(page.locator('main .section')).not.toHaveCount(0);

    const cardCount = await page.locator('article.card').count();
    expect(cardCount).toBeGreaterThanOrEqual(7);
  });

  test('serves a favicon so there is no missing-icon request', async ({ page }) => {
    await page.goto('/');
    const iconHref = await page.getAttribute('link[rel="icon"]', 'href');
    expect(iconHref, 'expected a <link rel="icon"> in the document head').toBeTruthy();

    const response = await page.request.get(iconHref as string);
    expect(response.status()).toBe(200);
  });

  test('theme toggle flips and persists the document theme across reloads', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    const initial = await html.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(initial);

    await page.locator('.theme-toggle').click();
    const toggled = await html.getAttribute('data-theme');
    expect(toggled).not.toBe(initial);

    const stored = await page.evaluate(() => localStorage.getItem('pr-theme'));
    expect(stored).toBe(toggled);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', toggled as string);
  });

  test('follows the OS colour scheme before any explicit choice', async ({ browser }) => {
    const dark = await browser.newContext({ colorScheme: 'dark' });
    const darkPage = await dark.newPage();
    await darkPage.goto('/');
    await expect(darkPage.locator('html')).toHaveAttribute('data-theme', 'dark');
    await dark.close();

    const light = await browser.newContext({ colorScheme: 'light' });
    const lightPage = await light.newPage();
    await lightPage.goto('/');
    await expect(lightPage.locator('html')).toHaveAttribute('data-theme', 'light');
    await light.close();
  });

  test('collapses the category nav into a working hamburger on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 460, height: 900 });
    await page.goto('/');

    const toggle = page.locator('.nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(page.locator('#topbar-nav')).toHaveClass(/is-open/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
