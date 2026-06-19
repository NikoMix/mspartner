import type { Group } from '@/lib/links';
import { Icon } from './Icon';
import { LinkCard } from './LinkCard';

export function CategorySection({ group }: { group: Group }) {
  return (
    <section className="section" id={group.id}>
      <div className="section-head">
        <span className="section-icon" style={{ background: group.accent }}>
          <Icon name={group.icon} />
        </span>
        <h2>{group.name}</h2>
      </div>
      {group.description ? <p className="section-desc">{group.description}</p> : null}
      <div className="card-grid">
        {group.links.map((link) => (
          <LinkCard key={link.url} link={link} accent={group.accent} />
        ))}
      </div>
    </section>
  );
}
