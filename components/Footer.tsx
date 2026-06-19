import type { SiteMeta } from '@/lib/links';

export function Footer({ site }: { site: SiteMeta }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>{site.footerNote ?? `© ${year} ${site.brand}`}</span>
        <span>
          <a href="https://partner.microsoft.com/" target="_blank" rel="noopener noreferrer">
            Partner home
          </a>
          {'  ·  '}
          <a href="https://learn.microsoft.com/partner-center/" target="_blank" rel="noopener noreferrer">
            Partner Center docs
          </a>
        </span>
      </div>
    </footer>
  );
}
