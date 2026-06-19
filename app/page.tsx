import { getLinks } from '@/lib/links';
import { TopBar } from '@/components/TopBar';
import { Hero } from '@/components/Hero';
import { CategorySection } from '@/components/CategorySection';
import { Footer } from '@/components/Footer';

export default function Home() {
  const { site, groups } = getLinks();

  return (
    <>
      <TopBar site={site} groups={groups} />
      <Hero site={site} groups={groups} />
      <main className="content">
        <div className="shell">
          {groups.map((group) => (
            <CategorySection key={group.id} group={group} />
          ))}
        </div>
      </main>
      <Footer site={site} />
    </>
  );
}
