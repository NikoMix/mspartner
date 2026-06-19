import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));

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
};

export default nextConfig;
