import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { motion, useScroll, useSpring } from 'motion/react';
import { MarketingFooter, MarketingNav, scrollToId, scrollToY, useLenis } from '@/features/landing/chrome';
import { STORY_PATH, useStoryReturn } from '@/store/story';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { HookSection, ProblemSection, ResearchSection } from './ProblemSections';
import { FearSection, NayaSection } from './NayaSections';
import { OrbitArrivesSection, SolutionSection } from './SolutionSections';
import { ClosingSection, ImpactSection, SdgContributionSection, SourcesSection } from './ImpactSections';

const CHAPTERS = [
  { id: 'facts', n: '01', en: 'The facts', idn: 'Fakta' },
  { id: 'problem', n: '02', en: 'The problem', idn: 'Masalah' },
  { id: 'research', n: '03', en: 'Research', idn: 'Riset' },
  { id: 'naya', n: '04', en: 'Naya', idn: 'Naya' },
  { id: 'orbit', n: '05', en: 'Orbit', idn: 'Orbit' },
  { id: 'solution', n: '06', en: 'Solution', idn: 'Solusi' },
  { id: 'impact', n: '07', en: 'Impact', idn: 'Dampak' },
  { id: 'sdg', n: '08', en: 'SDGs', idn: 'SDGs' },
];

/** Slide-style chapter navigation on the right edge (desktop). */
function ChapterRail() {
  const { t } = useT();
  const [active, setActive] = useState('facts');
  useEffect(() => {
    const ids = [...CHAPTERS.map((c) => c.id), 'fear'];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          setActive(e.target.id === 'fear' ? 'naya' : e.target.id);
        }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label={t('Chapters', 'Bab')} className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 min-[1400px]:block">
      <ol className="glass flex flex-col gap-1 rounded-full border border-border p-1.5 shadow-card">
        {CHAPTERS.map((c) => {
          const on = c.id === active;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => scrollToId(c.id)}
                aria-label={`${c.n} · ${t(c.en, c.idn)}`}
                aria-current={on ? 'step' : undefined}
                className="group relative flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
              >
                <span className={cn('tabular flex size-7 items-center justify-center rounded-full text-[10.5px] font-bold transition-all duration-300', on ? 'bg-green text-white shadow-green' : 'text-subtle-foreground group-hover:bg-surface-2 group-hover:text-foreground')}>{c.n}</span>
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[#13201a] px-2.5 py-1 text-[12px] font-semibold text-white opacity-0 shadow-pop transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-[#e7efea] dark:text-[#13201a]">
                  {t(c.en, c.idn)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function WhyOrbitPage() {
  useLenis();
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Coming back from a live feature: restore the exact place (and pillar) the reader left.
  useEffect(() => {
    const r = useStoryReturn.getState().ret;
    if (r?.path === STORY_PATH) {
      const timer = setTimeout(() => {
        scrollToY(r.scrollY);
        useStoryReturn.getState().clear();
      }, 80);
      return () => clearTimeout(timer);
    }
    if (location.hash) {
      const timer = setTimeout(() => scrollToId(location.hash.slice(1)), 350);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Why Orbit — Orbit';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <motion.div style={{ scaleX: progress }} className="orbit-gradient fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" aria-hidden />
      <MarketingNav />
      <ChapterRail />
      <main id="main" className="overflow-x-clip">
        <HookSection />
        <ProblemSection />
        <ResearchSection />
        <NayaSection />
        <FearSection />
        <OrbitArrivesSection />
        <SolutionSection />
        <ImpactSection />
        <SdgContributionSection />
        <ClosingSection />
        <SourcesSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
