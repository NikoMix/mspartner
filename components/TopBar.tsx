'use client';

import { useEffect, useState } from 'react';
import type { SiteMeta, Group } from '@/lib/links';
import { ThemeToggle } from './ThemeToggle';

export function TopBar({ site, groups }: { site: SiteMeta; groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(groups[0]?.id ?? '');

  // Scroll-spy: highlight the group whose section is currently in focus, so the
  // user always knows which group the sticky header belongs to.
  useEffect(() => {
    const ids = groups.map((g) => g.id);
    const offset = 64; // just below the 56px sticky topbar

    function onScroll() {
      let current = ids[0] ?? '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }
      setActive(current);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [groups]);

  return (
    <header className="topbar">
      <div className="shell">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label={site.brand}>
            <span className="ms-logo" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="brand-text">
              {site.brand}
              <small>Partner getting-started hub</small>
            </span>
          </a>

          <div className="topbar-actions">
            <nav
              id="topbar-nav"
              className={`topbar-nav${open ? ' is-open' : ''}`}
              aria-label="Resource categories"
            >
              {groups.map((g) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  className={g.id === active ? 'is-active' : undefined}
                  aria-current={g.id === active ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {g.name}
                </a>
              ))}
            </nav>

            <ThemeToggle />

            <button
              type="button"
              className="nav-toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="topbar-nav"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
