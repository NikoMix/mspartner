'use client';

import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pr-theme';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function readDocumentTheme(): Theme {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
  }
  return 'light';
}

function applyTheme(next: Theme, persist: boolean): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', next);
  }
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore storage failures (private mode, etc.) */
    }
  }
  notify();
}

// Subscribe React to the live theme sources: the OS colour-scheme preference and
// cross-tab storage changes. The inline script in app/layout.tsx applies the
// correct theme on first paint; this keeps the page in sync afterwards. While no
// explicit choice is stored we follow the system setting live; once the visitor
// toggles, their stored choice takes precedence.
function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  const media = window.matchMedia(COLOR_SCHEME_QUERY);

  const onSystemChange = () => {
    if (readStoredTheme() !== null) return;
    applyTheme(media.matches ? 'dark' : 'light', false);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    applyTheme(readStoredTheme() ?? (media.matches ? 'dark' : 'light'), false);
  };

  media.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(onStoreChange);
    media.removeEventListener('change', onSystemChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    readDocumentTheme,
    () => 'light',
  );

  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  function toggle() {
    applyTheme(isDark ? 'light' : 'dark', true);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2.5v2.4" />
            <path d="M12 19.1v2.4" />
            <path d="M2.5 12h2.4" />
            <path d="M19.1 12h2.4" />
            <path d="M5 5l1.7 1.7" />
            <path d="M17.3 17.3L19 19" />
            <path d="M19 5l-1.7 1.7" />
            <path d="M6.7 17.3L5 19" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.2A8 8 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
