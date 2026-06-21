import { test, expect } from '@playwright/test';
import { uniqueExternalUrls, externalEntries } from '../links.data';
import { verifyReachable } from '../helpers';

// One test per external entry so a broken link names the exact offending URL.
// Redirects are followed; the final status must be < 400 (no 404 or other dead
// link). A fast HTTP probe is used first, then a real Chromium navigation
// re-verifies anything an anti-bot gateway blocks, so genuine 404s fail while
// auth/bot-walled-but-alive endpoints (e.g. the sign-in-gated partner dashboard
// and the marketplace storefront) correctly pass.
test.describe('external link health', () => {
  test.describe.configure({ retries: 2 });

  for (const url of uniqueExternalUrls) {
    const labels = externalEntries
      .filter((entry) => entry.url === url)
      .map((entry) => `${entry.group} › ${entry.title}`)
      .join(', ');

    test(`reachable: ${url} (${labels})`, async ({ browser, request }) => {
      const verdict = await verifyReachable(browser, request, url);

      if (verdict.gated) {
        console.warn(
          `gated (alive): ${url} → HTTP ${verdict.status} at ${verdict.finalUrl} (auth/bot wall)`,
        );
      }

      expect(
        verdict.ok,
        `${url} resolved to HTTP ${verdict.status} at ${verdict.finalUrl}` +
          (verdict.error ? ` — ${verdict.error}` : ''),
      ).toBeTruthy();
    });
  }
});
