import type { LinkItem } from '@/lib/links';
import { Icon, ArrowIcon } from './Icon';

export function LinkCard({ link, accent }: { link: LinkItem; accent: string }) {
  return (
    <article className="card">
      <div className="card-accent" style={{ background: accent }} />
      <div className="card-body">
        <div className="card-top">
          <span className="card-icon" style={{ background: accent }}>
            <Icon name={link.icon} />
          </span>
          {link.badge ? <span className="card-pill">{link.badge}</span> : null}
        </div>
        <h3>{link.title}</h3>
        <p>{link.description}</p>
        <span className="card-link">
          {link.readable}
          <ArrowIcon />
        </span>
      </div>
      <a
        className="card-stretch"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${link.title} — opens in a new tab`}
      />
    </article>
  );
}
