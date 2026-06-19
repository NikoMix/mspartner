import type { SiteMeta, Group } from '@/lib/links';

export function Hero({ site, groups }: { site: SiteMeta; groups: Group[] }) {
  const first = groups[0];
  const funding = groups.find((g) => g.id.includes('funding')) ?? groups[1];
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <h1>{site.title}</h1>
        <p>{site.subtitle}</p>
        <div className="hero-actions">
          {first ? (
            <a className="btn btn-primary" href={`#${first.id}`}>
              Start here
            </a>
          ) : null}
          {funding ? (
            <a className="btn btn-ghost" href={`#${funding.id}`}>
              Explore funding
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
