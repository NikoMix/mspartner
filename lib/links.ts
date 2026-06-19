import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type IconKey =
  | 'rocket'
  | 'badge'
  | 'sparkle'
  | 'money'
  | 'school'
  | 'news'
  | 'book'
  | 'shield'
  | 'link';

export interface LinkItem {
  title: string;
  description: string;
  url: string;
  readable: string;
  icon: IconKey;
  badge?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  accent: string;
  icon: IconKey;
  links: LinkItem[];
}

export interface SiteMeta {
  brand: string;
  title: string;
  subtitle: string;
  footerNote?: string;
}

export interface LinksData {
  site: SiteMeta;
  groups: Group[];
}

const DEFAULT_ACCENT = '#0f6cbd';
const VALID_ICONS: IconKey[] = [
  'rocket',
  'badge',
  'sparkle',
  'money',
  'school',
  'news',
  'book',
  'shield',
  'link',
];

function normalizeIcon(value: unknown): IconKey {
  return VALID_ICONS.includes(value as IconKey) ? (value as IconKey) : 'link';
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Reads and validates the central YAML catalog at build time.
 * Runs inside Server Components during static export, so the result is
 * baked into the prerendered HTML.
 */
export function getLinks(): LinksData {
  const file = path.join(process.cwd(), 'data', 'links.yaml');
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = yaml.load(raw) as Partial<LinksData> | undefined;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('data/links.yaml is empty or malformed.');
  }

  const site: SiteMeta = {
    brand: parsed.site?.brand ?? 'Partner Resources',
    title: parsed.site?.title ?? 'Microsoft Partner — Getting Started',
    subtitle: parsed.site?.subtitle ?? '',
    footerNote: parsed.site?.footerNote,
  };

  const groups: Group[] = (parsed.groups ?? []).map((g, gi) => ({
    id: g.id ?? `group-${gi}`,
    name: g.name ?? 'Resources',
    description: g.description,
    accent: g.accent ?? DEFAULT_ACCENT,
    icon: normalizeIcon(g.icon),
    links: (g.links ?? []).map((l) => ({
      title: l.title ?? 'Untitled',
      description: l.description ?? '',
      url: l.url ?? '#',
      readable: l.readable ?? hostOf(l.url ?? ''),
      icon: normalizeIcon(l.icon),
      badge: l.badge,
    })),
  }));

  return { site, groups };
}
