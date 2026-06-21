import { test, expect } from '@playwright/test';
import { catalogLinks, chromeLinks } from '../links.data';
import { normalizeUrl } from '../helpers';

// Tie the link-health checks to what the deployed page actually renders: every
// catalog + chrome URL must appear as a real anchor, and no card may point at an
// empty or dead "#" href. This guards against the catalog and the rendered DOM
// drifting apart.
test.describe('DOM ↔ catalog parity', () => {
  test('every catalog and chrome link is rendered as an external anchor', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const renderedHrefs = await page.$$eval('a[href^="http"]', (anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).href),
    );
    const renderedSet = new Set(renderedHrefs.map((href) => normalizeUrl(href)));

    const expected = [...catalogLinks, ...chromeLinks].map((entry) => normalizeUrl(entry.url));
    const missing = expected.filter((url) => !renderedSet.has(url));

    expect(missing, `links missing from the rendered page:\n${missing.join('\n')}`).toEqual([]);
  });

  test('no link card has an empty or dead href', async ({ page }) => {
    await page.goto('/');

    const cardHrefs = await page.$$eval('article.card a.card-stretch', (anchors) =>
      anchors.map((a) => a.getAttribute('href') ?? ''),
    );

    expect(cardHrefs.length, 'expected at least one link card').toBeGreaterThan(0);
    for (const href of cardHrefs) {
      expect(href.trim()).not.toBe('');
      expect(href.trim()).not.toBe('#');
      expect(href, `card href is not an absolute URL: "${href}"`).toMatch(/^https?:\/\//i);
    }
  });

  test('the two new entries are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Microsoft Marketplace' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Microsoft Partner Center' })).toBeVisible();
  });
});
