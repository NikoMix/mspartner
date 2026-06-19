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
```

> Requires Node 20.9+ (developed on Node 24; CI builds on Node 24). Build output
> is a static site, so `npm run start` is not used — host the contents of `out/`
> instead.

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
rocket | badge | sparkle | money | school | news | book | shield | link
```

Unknown icon values fall back to `link` automatically. Icons are inline SVGs
defined in `components/Icon.tsx` — add a new entry there to introduce a new key.

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
│  └─ globals.css         ported Fluent-style theme tokens
├─ components/
│  ├─ TopBar.tsx          brand + category nav (client: hamburger + scroll-spy)
│  ├─ ThemeToggle.tsx     dark/light switch (client; persists to localStorage)
│  ├─ Hero.tsx            title, subtitle, CTAs
│  ├─ CategorySection.tsx one group → sticky heading + card grid
│  ├─ LinkCard.tsx        one link card
│  ├─ Footer.tsx          footer note
│  └─ Icon.tsx            inline-SVG icon map
├─ lib/
│  └─ links.ts            types + build-time YAML loader (getLinks)
├─ next.config.mjs        output: 'export' (static site)
└─ package.json
```

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
