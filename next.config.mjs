import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));

// GitHub Pages *project* sites are served from https://<owner>.github.io/<repo>/,
// so every asset must be prefixed with the repo path. The Pages workflow passes
// that prefix via PAGES_BASE_PATH (sourced from actions/configure-pages). When
// the variable is unset — local `next build`, `npm run serve`, custom domains —
// the site is built for the domain root, so nothing changes locally.
const rawBasePath = process.env.PAGES_BASE_PATH ?? '';
const basePath = rawBasePath === '/' ? '' : rawBasePath.replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a fully static site in ./out via `next build`
  output: 'export',
  // Required for static export (no Image Optimization server)
  images: { unoptimized: true },
  // Emit folder-style routes (/page/index.html) for friendlier static hosting
  trailingSlash: true,
  // Pin the workspace root to this folder so Next.js does not pick up a
  // parent-directory lockfile (e.g. C:\Users\nikomix\package-lock.json).
  outputFileTracingRoot: projectRoot,
  // Serve routes and `/_next/` assets from the Pages sub-path when deploying to
  // a project site. basePath already prefixes static assets, so no separate
  // assetPrefix is needed.
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
