import type { APIRequestContext, Browser, Page } from '@playwright/test';

// A realistic browser identity. Some hosts reject the default automation
// User-Agent or HEAD requests with 4xx even though the page is healthy in a
// real browser, so we always GET with these headers.
export const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Transient statuses worth a retry; a stable 404/410/403 is a real failure.
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export interface LinkProbe {
  url: string;
  status: number;
  finalUrl: string;
  ok: boolean;
  redirected: boolean;
  error?: string;
}

export interface ProbeOptions {
  attempts?: number;
  timeout?: number;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Probe a URL the way a browser would: follow redirects and treat any final
 * status in the 2xx–3xx range as healthy. Retries transient failures with
 * exponential backoff so flaky networks do not produce false negatives.
 */
export async function probeUrl(
  request: APIRequestContext,
  url: string,
  { attempts = 3, timeout = 30_000 }: ProbeOptions = {},
): Promise<LinkProbe> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await request.get(url, {
        headers: BROWSER_HEADERS,
        maxRedirects: 20,
        timeout,
        failOnStatusCode: false,
      });
      const status = response.status();
      const finalUrl = response.url();
      const ok = status >= 200 && status < 400;

      if (ok || !RETRYABLE_STATUS.has(status) || attempt === attempts) {
        return {
          url,
          status,
          finalUrl,
          ok,
          redirected: finalUrl.replace(/\/$/, '') !== url.replace(/\/$/, ''),
          error: ok ? undefined : `HTTP ${status}`,
        };
      }
      lastError = `HTTP ${status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === attempts) {
        return { url, status: 0, finalUrl: url, ok: false, redirected: false, error: lastError };
      }
    }

    await sleep(600 * 2 ** (attempt - 1) + Math.floor(Math.random() * 300));
  }

  return { url, status: 0, finalUrl: url, ok: false, redirected: false, error: lastError ?? 'unknown error' };
}

export interface PageDiagnostics {
  consoleErrors: string[];
  badResponses: string[];
}

/**
 * Attach listeners that record console errors, uncaught page exceptions, and
 * any same-document resource that returns an HTTP error. Call before navigation.
 */
export function attachDiagnostics(page: Page): PageDiagnostics {
  const consoleErrors: string[] = [];
  const badResponses: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });
  page.on('response', (res) => {
    const status = res.status();
    // 3xx are followed by the browser; only final 4xx/5xx are real failures.
    if (status >= 400) badResponses.push(`${status} ${res.request().method()} ${res.url()}`);
  });

  return { consoleErrors, badResponses };
}

export function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

// Statuses that mean "the server answered and the path exists, but access is
// gated" (auth wall or anti-bot WAF). These are NOT broken links — a 404/410
// would be. `partner.microsoft.com/dashboard` (sign-in) and the marketplace
// storefront (Akamai bot protection) legitimately fall here for headless clients.
const GATED_STATUS = new Set([401, 403, 429]);
// Statuses worth re-checking through a real browser, which presents a genuine
// TLS/HTTP fingerprint that anti-bot gateways accept.
const BROWSER_RETRY_STATUS = new Set([401, 403, 429, 0]);

export interface LinkVerdict extends LinkProbe {
  gated: boolean;
  via: 'http' | 'browser';
}

/**
 * Verify that a link is reachable the way the user cares about: it must not be a
 * dead/broken link (404/410), a server error, or unresolvable. A fast HTTP probe
 * is tried first; if an anti-bot gateway blocks it (401/403/429) or the network
 * call fails, the URL is re-verified with a real Chromium navigation. A final
 * gated response (alive but auth/bot-walled) is reported as reachable, since the
 * destination demonstrably exists.
 */
export async function verifyReachable(
  browser: Browser,
  request: APIRequestContext,
  url: string,
): Promise<LinkVerdict> {
  const probe = await probeUrl(request, url);
  if (probe.ok) return { ...probe, gated: false, via: 'http' };
  if (!BROWSER_RETRY_STATUS.has(probe.status)) {
    return { ...probe, gated: false, via: 'http' };
  }

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: BROWSER_HEADERS['User-Agent'],
    extraHTTPHeaders: { 'Accept-Language': BROWSER_HEADERS['Accept-Language'] },
  });
  try {
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    const status = response?.status() ?? 0;
    const finalUrl = page.url();
    const ok = status >= 200 && status < 400;
    const gated = GATED_STATUS.has(status);
    return {
      url,
      status,
      finalUrl,
      ok: ok || gated,
      redirected: normalizeUrl(finalUrl) !== normalizeUrl(url),
      error: ok || gated ? undefined : `HTTP ${status} (browser)`,
      gated,
      via: 'browser',
    };
  } catch (err) {
    // If the HTTP probe was a gated status, trust that the endpoint is alive even
    // when a headless browser challenge fails to settle.
    if (GATED_STATUS.has(probe.status)) {
      return { ...probe, ok: true, gated: true, via: 'browser' };
    }
    return {
      ...probe,
      ok: false,
      gated: false,
      via: 'browser',
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await context.close();
  }
}
