import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// A focused accessibility gate: the page must have no serious or critical WCAG
// 2.1 A/AA violations. Lesser advisory findings are attached to the report for
// review but do not fail the build.
test('home page has no serious or critical accessibility violations', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  await testInfo.attach('axe-results.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  const summary = blocking
    .map((v) => `${v.id} (${v.impact}) — ${v.help} [${v.nodes.length} node(s)]`)
    .join('\n');

  expect(blocking, `serious/critical a11y violations:\n${summary}`).toEqual([]);
});
