import { test, expect } from '@playwright/test';

// Internal navigation is entirely in-page hash anchors (brand, hero CTAs, the
// category nav). Every anchor must target a section that exists, and clicking a
// category must move focus to that section — never a 404 or a dead jump.
test.describe('in-page navigation', () => {
  test('every hash anchor targets an element that exists', async ({ page }) => {
    await page.goto('/');

    const hashes = await page.$$eval('a[href^="#"]', (anchors) =>
      Array.from(
        new Set(
          anchors
            .map((a) => a.getAttribute('href') ?? '')
            .filter((href) => href.length > 1),
        ),
      ),
    );

    expect(hashes.length, 'expected in-page hash anchors').toBeGreaterThan(0);

    for (const hash of hashes) {
      const id = hash.slice(1);
      await expect(
        page.locator(`[id="${id}"]`),
        `nav anchor ${hash} has no matching element`,
      ).toHaveCount(1);
    }
  });

  test('clicking a category link jumps to that section', async ({ page }) => {
    await page.goto('/');

    const sectionIds = await page.$$eval('main section[id]', (sections) =>
      sections.map((section) => section.id),
    );
    expect(sectionIds).toContain('start-here');

    const target = sectionIds[sectionIds.length - 1];

    // Open the menu first when it is collapsed behind the hamburger (mobile).
    const toggle = page.locator('.nav-toggle');
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(page.locator('#topbar-nav')).toHaveClass(/is-open/);
    }

    await page.locator(`#topbar-nav a[href="#${target}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${target}$`));
    await expect(page.locator(`[id="${target}"]`)).toBeInViewport();
  });

  test('the brand logo links back to the top of the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a.brand')).toHaveAttribute('href', '#top');
    await expect(page.locator('#top')).toHaveCount(1);
  });
});
