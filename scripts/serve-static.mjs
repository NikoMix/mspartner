// Zero-dependency static file server for the exported `out/` site.
//
// Why hand-rolled instead of a package (e.g. `serve`)? It keeps the dependency
// surface minimal and license-clean, has no install step in CI, and lets us
// optionally mount the site under a sub-path (`--base /mspartner`) so local and
// CI runs can mirror the GitHub Pages *project-site* URL exactly.
//
// Usage:
//   node scripts/serve-static.mjs [dir] [--port 3100] [--base /mspartner] [--host 127.0.0.1]
//
// Defaults: dir=out, port=3100, base=/ (root), host=127.0.0.1.
// Honors PORT / E2E_SERVE_BASE / E2E_SERVE_HOST env vars when flags are absent.

import { createServer } from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i += 1;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));

const rootDir = resolve(positional[0] ?? 'out');
const port = Number(flags.port ?? process.env.PORT ?? 3100);
const host = String(flags.host ?? process.env.E2E_SERVE_HOST ?? '127.0.0.1');

// Normalize the mount base to either '' (root) or '/segment' with no trailing slash.
function normalizeBase(value) {
  if (!value || value === true || value === '/') return '';
  const trimmed = `/${String(value).replace(/^\/+|\/+$/g, '')}`;
  return trimmed === '/' ? '' : trimmed;
}

const base = normalizeBase(flags.base ?? process.env.E2E_SERVE_BASE);

const CONTENT_TYPES = new Map(
  Object.entries({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.map': 'application/json; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
  }),
);

function contentTypeFor(filePath) {
  return CONTENT_TYPES.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}

async function resolveFile(urlPath) {
  // Map a URL path to a file on disk, guarding against path traversal and
  // resolving directory requests to their index.html (trailingSlash export).
  let pathname = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);

  if (base) {
    if (pathname === base) {
      pathname = '/';
    } else if (pathname.startsWith(`${base}/`)) {
      pathname = pathname.slice(base.length);
    } else {
      return null; // outside the mounted base
    }
  }

  const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let candidate = resolve(rootDir, `.${safe.startsWith('/') ? safe : `/${safe}`}`);

  // Never serve anything outside rootDir.
  if (candidate !== rootDir && !candidate.startsWith(rootDir + sep)) {
    return null;
  }

  try {
    const stats = await fs.stat(candidate);
    if (stats.isDirectory()) {
      candidate = join(candidate, 'index.html');
      await fs.stat(candidate);
    }
    return candidate;
  } catch {
    // Fall back to <path>.html (e.g. /foo -> /foo.html) for non-trailingSlash hosts.
    try {
      const htmlCandidate = `${candidate}.html`;
      await fs.stat(htmlCandidate);
      return htmlCandidate;
    } catch {
      return null;
    }
  }
}

const server = createServer(async (req, res) => {
  try {
    const filePath = await resolveFile(req.url ?? '/');
    if (!filePath) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'content-type': contentTypeFor(filePath),
      'cache-control': 'no-cache',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(filePath)
      .on('error', () => {
        if (!res.headersSent) res.writeHead(500);
        res.end('500 Internal Server Error');
      })
      .pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
  }
});

server.listen(port, host, () => {
  const shown = host === '0.0.0.0' ? '127.0.0.1' : host;
  console.log(`Serving ${rootDir} at http://${shown}:${port}${base || ''}/`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
