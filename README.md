# Microsoft Partner — Getting Started

A small **Next.js (App Router) + React** app that renders a curated, static
launchpad of "getting started" links for Microsoft Partners — programs, funding,
skilling, and community resources — grouped into logical categories.

Every link on the page is driven by a single, central YAML file
(`data/links.yaml`). Edit that one file to add, remove, reorder, or re-theme
resources; no component code changes required. The site builds to a fully
static export (`out/`) that can be hosted anywhere.

The visual theme mirrors the Microsoft Fluent look (MS-blue palette, Segoe UI
type ramp, soft elevation cards), ported to plain CSS tokens in
`app/globals.css` so the static export has zero runtime style flash.

---

## Quick start

```bash
cd partner-resources
npm install        # first time only

npm run dev        # local dev server  → http://localhost:3000
npm run build      # static export      → ./out
npm run serve      # serve the built ./out on http://localhost:3100
npm run test:e2e:local   # build + serve + run the Playwright E2E suite
```

> Requires Node 20.9+ (developed on Node 24; CI builds on Node 24). Build output
> is a static site, so `npm run start` is not used — host the contents of `out/`
> instead. `npm run serve` uses a small zero-dependency static server
> (`scripts/serve-static.mjs`) — no extra packages, no install step.

---

## Editing the links (the only file you need)

All content lives in **`data/links.yaml`**. It is read at **build time** and
embedded directly into the static HTML, so the site stays fully static.

```yaml
site:
  brand: "Partner Resources"          # text next to the logo
  title: "Microsoft Partner — Getting Started"
  subtitle: "One or two sentences shown in the hero."
  footerNote: "Shown in the footer."

groups:
  - id: start-here                     # unique slug → used for the #anchor
    name: "Start Here"                 # category heading
    description: "Optional blurb under the heading."
    accent: "#0f6cbd"                  # category + card accent color (hex)
    icon: rocket                       # category icon (see keys below)
    links:
      - title: "Microsoft AI Cloud Partner Program"   # required
        description: "One or two sentences."          # required
        url: "https://partner.microsoft.com/en-US/"   # required
        readable: "partner.microsoft.com"             # optional display URL
        icon: rocket                                  # optional (default: link)
        badge: "Start"                                # optional pill on the card
```

### Field reference

**Group fields**

| Field         | Required | Purpose                                            |
| ------------- | -------- | -------------------------------------------------- |
| `id`          | yes      | Unique slug; used as the in-page `#anchor`.        |
| `name`        | yes      | Category heading.                                  |
| `description` | no       | Short blurb under the heading.                     |
| `accent`      | no       | Hex color for the category + its cards (default blue). |
| `icon`        | no       | Icon key for the category header.                  |
| `links`       | yes      | Ordered list of link cards (see below).            |

**Link fields**

| Field         | Required | Purpose                                            |
| ------------- | -------- | -------------------------------------------------- |
| `title`       | yes      | Card heading.                                      |
| `description` | yes      | One or two sentences describing the resource.      |
| `url`         | yes      | Full destination URL (`https://…`).                |
| `readable`    | no       | Short display version of the URL (defaults to host). |
| `icon`        | no       | One of the icon keys below (defaults to `link`).   |
| `badge`       | no       | Small pill shown on the card (e.g. `New`, `AI`).   |

### Available icon keys

```
rocket | badge | sparkle | money | school | news | book | shield | store | grid | link
```

Unknown icon values fall back to `link` automatically. Icons are inline SVGs
defined in `components/Icon.tsx` — add a new entry there (and to the `IconKey`
union + `VALID_ICONS` list in `lib/links.ts`) to introduce a new key.

### Order matters

Groups render top-to-bottom in the order they appear in the YAML, and links
render in the order listed within each group. Reordering the YAML reorders the
page. The hero's primary button targets the **first** group; its secondary
button targets the first group whose `id` contains `funding`.

After editing, restart/refresh `npm run dev`, or run `npm run build` to
regenerate the static `out/`.

---

## Appearance & interaction

- **Dark / light theme.** The page honors the visitor's OS preference
  (`prefers-color-scheme`) on first load and offers a sun/moon toggle in the top
  bar to switch manually. Until an explicit choice is made the page keeps
  following the system setting **live** — flip your OS between light and dark and
  the page updates without a reload. A manual toggle is persisted in
  `localStorage` under the key **`pr-theme`** and is synced across open tabs; a
  tiny inline script in `app/layout.tsx` applies the saved theme *before* first
  paint, so there is no light-to-dark flash on reload. `ThemeToggle.tsx`
  subscribes to those sources via React's `useSyncExternalStore`. Colors are
  driven by CSS custom properties; the dark palette lives in the
  `[data-theme='dark']` block of `app/globals.css`.
- **Responsive top menu.** On medium and small screens the category nav collapses
  into a hamburger dropdown so the "Partner Resources" brand never wraps or
  breaks. The button animates to an X while open and closes automatically when a
  category link is tapped.
- **Sticky group headers + scroll-spy.** Each category heading sticks just below
  the top bar while you scroll through its cards, and the matching nav link is
  highlighted, so the group currently in focus is always obvious.
- **No login or registration.** This is a public, read-only launchpad — there is
  no auth, account, or gated content of any kind.

---

## Project structure

```
partner-resources/
├─ data/
│  └─ links.yaml          ← THE editable catalog (start here)
├─ app/
│  ├─ layout.tsx          root layout + metadata
│  ├─ page.tsx            reads links.yaml, renders the page
│  ├─ icon.svg            favicon (file-based metadata icon; avoids a 404)
│  └─ globals.css         ported Fluent-style theme tokens
├─ components/
│  ├─ TopBar.tsx          brand + category nav (client: hamburger + scroll-spy)
│  ├─ ThemeToggle.tsx     dark/light switch (client; persists to localStorage)
│  ├─ Hero.tsx            title, subtitle, CTAs
│  ├─ CategorySection.tsx one group → sticky heading + card grid
│  ├─ LinkCard.tsx        one link card
│  ├─ Footer.tsx          footer note + Partner links
│  └─ Icon.tsx            inline-SVG icon map
├─ lib/
│  └─ links.ts            types + build-time YAML loader (getLinks)
├─ scripts/
│  └─ serve-static.mjs    zero-dependency static server for ./out
├─ tests/e2e/             Playwright suite (ui/ + health/ + helpers)
├─ playwright.config.ts   E2E run modes (live / local build+serve / explicit URL)
├─ .github/workflows/
│  ├─ deploy-pages.yml    build → deploy → verify the live site
│  └─ e2e.yml             PR gate + weekly link-health canary
├─ next.config.mjs        output: 'export' (static site)
└─ package.json
```

---

## Testing (Playwright E2E)

End-to-end tests live in `tests/e2e/` and run with
[Playwright](https://playwright.dev) (Apache-2.0). They verify that the deployed
page works in a real browser, with **zero console errors**, and that **every
link resolves** (no 404s; redirects followed).

| Area | File | What it checks |
| ---- | ---- | -------------- |
| Smoke | `ui/smoke.spec.ts` | No console/page errors or failed requests; hero + sections + cards render; favicon present; theme toggle flips, persists, and follows the OS scheme; responsive hamburger works. |
| Navigation | `ui/navigation.spec.ts` | Every in-page `#anchor` targets a real element; clicking a category scrolls to its section; the brand returns to the top. |
| Accessibility | `ui/accessibility.spec.ts` | No **serious/critical** WCAG 2.1 A/AA violations (via `@axe-core/playwright`, MPL-2.0). |
| Link health | `health/link-health.spec.ts` | One check per external URL — reachable with redirects followed and final status `< 400`. |
| DOM parity | `health/dom-parity.spec.ts` | Every catalog + footer link is actually rendered as an external anchor; no empty/`#` card links. |

UI specs run across Chromium, Firefox, WebKit, and a mobile profile; the
link-health/parity checks run once (Chromium) to avoid hammering external hosts.

```bash
npm run test:e2e:local    # build the export, serve it, run everything locally
npm run test:e2e          # run against the live site (default) or E2E_BASE_URL
npm run test:e2e:report   # open the last HTML report
npm run typecheck:e2e     # type-check the test sources
```

**Targeting.** By default the suite runs against the live GitHub Pages URL.
Set `E2E_LOCAL=1` to build + serve the export locally first, or
`E2E_BASE_URL=<url>` to point at any deployment (the post-deploy CI job uses the
freshly published `page_url`).

**Link-health policy.** Checks follow redirects and pass on any final status
`< 400`. A few Microsoft endpoints sit behind a sign-in wall or an anti-bot
gateway (e.g. the Partner Center dashboard and the Marketplace storefront) and
answer automated clients with `401/403/429` even though they load fine in a
browser. Those are re-verified with a real Chromium navigation and treated as
**reachable-but-gated** (logged as a warning) — only genuine `404/410`, server
errors, or unresolvable hosts fail the build.

---

## Deploying the static site

`npm run build` produces a self-contained static site in `out/`. Upload that
folder to any static host:

- **Azure Static Web Apps** — app/output location `out`.
- **GitHub Pages**, **Netlify**, **Vercel (static)**, **S3/CloudFront**, or any
  plain web server / CDN.

Because `output: 'export'` is set (with `images.unoptimized` and
`trailingSlash`), there is no Node server requirement at runtime.

### GitHub Pages (automated)

This repo ships a workflow — `.github/workflows/deploy-pages.yml` — that builds
the static export and publishes it to GitHub Pages on every push to `main` (and
on demand from the **Actions** tab).

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.
After that, each push to `main` lint-checks, builds, and deploys automatically.
A final **verify** job then runs Playwright against the freshly published URL to
confirm the live site loads cleanly and every link still resolves.

The site is published as a **project site** at
`https://<owner>.github.io/<repo>/`, so assets must be served from the repo
sub-path. The workflow reads that prefix from `actions/configure-pages` and
passes it to the build via the `PAGES_BASE_PATH` environment variable, which
`next.config.mjs` applies as Next's `basePath`. Local `npm run build` /
`npm run serve` leave `PAGES_BASE_PATH` unset and build for the domain root, so
nothing changes locally. A `.nojekyll` marker is emitted so GitHub serves the
underscore-prefixed `_next/` directory verbatim.

---

## Notes

- Links are curated for convenience — always confirm current program details on
  the official Microsoft sites.
- The theme is implemented as plain CSS (no Fluent/Griffel runtime) to keep the
  static export flash-free and dependency-light.
