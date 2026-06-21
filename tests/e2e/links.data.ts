import { getLinks } from '../../lib/links';

export interface ExternalEntry {
  group: string;
  title: string;
  url: string;
}

const { groups } = getLinks();

// Every link card in the catalog (data/links.yaml) — the "entries" the page is
// built from. Read at collection time so we can generate one test per URL.
export const catalogLinks: ExternalEntry[] = groups.flatMap((group) =>
  group.links.map((link) => ({ group: group.name, title: link.title, url: link.url })),
);

// External links rendered in the page chrome but not part of the YAML catalog
// (see components/Footer.tsx). dom-parity.spec.ts fails if these drift, which is
// the signal to update this list.
export const chromeLinks: ExternalEntry[] = [
  { group: 'Footer', title: 'Partner home', url: 'https://partner.microsoft.com/' },
  { group: 'Footer', title: 'Partner Center docs', url: 'https://learn.microsoft.com/partner-center/' },
];

const isExternal = (url: string): boolean => /^https?:\/\//i.test(url);

export const externalEntries: ExternalEntry[] = [...catalogLinks, ...chromeLinks].filter((entry) =>
  isExternal(entry.url),
);

// De-duplicated, stable-ordered list of every external URL the site links to.
export const uniqueExternalUrls: string[] = Array.from(
  new Set(externalEntries.map((entry) => entry.url)),
).sort((a, b) => a.localeCompare(b));
