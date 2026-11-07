import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import Lenis from 'lenis';
import { ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/brand';
import { Button } from '@/components/ui/button';
import { LanguageToggle, ThemeToggle } from '@/components/shared/toggles';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { cn, prefersReducedMotion } from '@/lib/utils';
import { ease } from '@/lib/motion';

let lenis: Lenis | null = null;

/** Smooth scrolling for storytelling pages. Disabled for reduced motion; overlays opt out via data-lenis-prevent. */
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const l = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 });
    lenis = l;
    let raf = 0;
    const loop = (time: number) => {
      l.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    // Pause while dialogs are open so overlays scroll natively.
    const obs = new MutationObserver(() => {
      const locked = document.body.hasAttribute('data-scroll-locked') || Boolean(document.querySelector('[role="dialog"]'));
      if (locked) l.stop();
      else l.start();
    });
    obs.observe(document.body, { attributes: true, childList: true, subtree: false });
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      l.destroy();
      lenis = null;
    };
  }, []);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.2 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

const LINKS = [
  { id: 'mission', en: 'Our Purpose', idn: 'Tujuan' },
  { id: 'compass', en: 'Learning Compass', idn: 'Kompas Belajar' },
  { id: 'flow', en: 'How It Works', idn: 'Cara Kerja' },
  { id: 'sdg', en: 'SDG 4', idn: 'SDG 4' },
  { id: 'campus', en: 'For Campus', idn: 'Untuk Kampus', to: '/campus' },
  { id: 'faq', en: 'FAQ', idn: 'FAQ' },
];

export function MarketingNav() {
  const { t } = useT();
  const mode = useOrbit((s) => s.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

  useEffect(() => {
    if (location.pathname !== '/') return;
    const ids = LINKS.filter((l) => !l.to).map((l) => l.id);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [location.pathname]);

  const go = (l: (typeof LINKS)[number]) => {
    setOpen(false);
    if (l.to) return navigate(l.to);
    if (location.pathname !== '/') return navigate(`/#${l.id}`);
    scrollToId(l.id);
  };
  const cta = mode === 'none' ? { to: '/start', label: t('Build My Orbit', 'Bangun Orbit Saya') } : { to: '/app', label: t('Open my Orbit', 'Buka Orbit saya') };

  return (
    <>
      <motion.header
        className={cn('fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300', scrolled ? 'glass border-b border-border shadow-[0_8px_30px_-18px_rgba(16,32,24,0.25)]' : 'border-b border-transparent')}
      >
        <nav aria-label={t('Main', 'Utama')} className={cn('container-orbit flex items-center gap-6 transition-[height] duration-300', scrolled ? 'h-16' : 'h-[76px]')}>
          <Link to="/" aria-label="Orbit" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]" onClick={() => location.pathname === '/' && (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }))}>
            <Logo />
          </Link>
          <ul className="hidden items-center gap-0.5 xl:flex">
            {LINKS.map((l) => {
              const isActive = l.to ? location.pathname === l.to : location.pathname === '/' && active === l.id;
              return (
                <li key={l.id}>
                  <button type="button" onClick={() => go(l)} className={cn('relative rounded-lg px-3 py-2 text-[14px] font-medium transition-colors', isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                    {isActive && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-green" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                    {t(l.en, l.idn)}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="ml-auto flex items-center gap-1.5">
            <LanguageToggle className="hidden md:inline-flex" />
            <ThemeToggle />
            <Link to="/signin" className="hidden rounded-lg px-3 py-2 text-[14px] font-semibold text-muted-foreground transition hover:text-foreground md:block">
              {t('Sign In', 'Masuk')}
            </Link>
            <Button asChild size={scrolled ? 'sm' : 'md'} className="hidden sm:inline-flex">
              <Link to={cta.to}>
                {cta.label} <ArrowRight />
              </Link>
            </Button>
            <button type="button" onClick={() => setOpen(true)} className="flex size-10 items-center justify-center rounded-xl text-foreground transition hover:bg-surface-2 xl:hidden" aria-label={t('Open menu', 'Buka menu')} aria-expanded={open}>
              <Menu className="size-5" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label={t('Menu', 'Menu')}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              className="absolute inset-x-3 top-3 rounded-[26px] border border-border bg-surface p-5 shadow-pop"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-xl hover:bg-surface-2" aria-label={t('Close menu', 'Tutup menu')}>
                  <X className="size-5" />
                </button>
              </div>
              <ul className="mt-5 space-y-1">
                {LINKS.map((l, i) => (
                  <motion.li key={l.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <button type="button" onClick={() => go(l)} className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left font-display text-[18px] font-bold transition hover:bg-surface-2">
                      {t(l.en, l.idn)} <ArrowUpRight className="size-4 text-subtle-foreground" />
                    </button>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                <LanguageToggle />
                <Link to="/signin" className="text-[14px] font-semibold text-muted-foreground" onClick={() => setOpen(false)}>
                  {t('Sign In', 'Masuk')}
                </Link>
              </div>
              <Button asChild size="lg" className="mt-4 w-full">
                <Link to={cta.to} onClick={() => setOpen(false)}>
                  {cta.label} <ArrowRight />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MarketingFooter() {
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useOrbit((s) => s.mode);
  const link = (id: string) => () => (location.pathname === '/' ? scrollToId(id) : navigate(`/#${id}`));
  const cols: { title: string; items: { label: string; onClick?: () => void; to?: string }[] }[] = [
    {
      title: t('Platform', 'Platform'),
      items: [
        { label: t('How It Works', 'Cara Kerja'), onClick: link('flow') },
        { label: t('Learning Compass', 'Kompas Belajar'), onClick: link('compass') },
        { label: 'Career Universe', onClick: link('universe') },
        { label: 'Journey', onClick: link('journey') },
        { label: 'Discover', onClick: link('capabilities') },
      ],
    },
    {
      title: t('Resources', 'Sumber'),
      items: [
        { label: t('Career Guide', 'Panduan Karier'), onClick: link('intelligence') },
        { label: 'FAQ', onClick: link('faq') },
        { label: t('Our role in education', 'Peran kami di pendidikan'), onClick: link('complement') },
        { label: t('About Orbit', 'Tentang Orbit'), onClick: link('mission') },
      ],
    },
    {
      title: t('Built For', 'Dibuat Untuk'),
      items: [
        { label: t('SMA/SMK Students', 'Siswa SMA/SMK'), to: '/start' },
        { label: t('University Students', 'Mahasiswa'), to: '/start' },
        { label: t('Graduates & Job Seekers', 'Lulusan & Pencari Kerja'), to: '/start' },
        { label: t('Schools & Campuses', 'Sekolah & Kampus'), to: '/campus' },
      ],
    },
  ];
  return (
    <footer className="relative overflow-hidden border-t border-border bg-gradient-to-br from-mint via-background to-cream">
      <div className="pointer-events-none absolute -right-40 -top-40 size-[420px] rounded-full bg-green/10 blur-3xl" aria-hidden />
      <div className="container-orbit relative py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr_1.3fr]">
          <div>
            <Logo />
            <p className="mt-5 font-display text-[20px] font-bold leading-snug tracking-tight">{t('Every lesson, aimed at your future.', 'Setiap pelajaran, terarah ke masa depanmu.')}</p>
            <p className="mt-2 max-w-xs text-[14px] text-muted-foreground">{t('A goal-centred learning system that connects what you study to the career you want — alongside your school and campus.', 'Sistem belajar berpusat pada tujuan yang menghubungkan apa yang kamu pelajari dengan karier yang kamu inginkan — berdampingan dengan sekolah dan kampusmu.')}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-[13px] font-bold uppercase tracking-wider text-foreground">{c.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((it) => (
                    <li key={it.label}>
                      {it.to ? (
                        <Link to={it.to} className="text-[14px] text-muted-foreground transition hover:text-green-strong dark:hover:text-green">
                          {it.label}
                        </Link>
                      ) : (
                        <button type="button" onClick={it.onClick} className="text-[14px] text-muted-foreground transition hover:text-green-strong dark:hover:text-green">
                          {it.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-[24px] bg-[#0f1d16] p-6 text-white shadow-pop">
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-green/35 blur-3xl" aria-hidden />
            <div className="relative font-display text-[20px] font-bold leading-snug">{t('Ready to build your Orbit?', 'Siap membangun Orbit-mu?')}</div>
            <p className="relative mt-2 text-[14px] text-white/65">{t('Start your goal-centred learning journey today.', 'Mulai journey belajar yang terarah hari ini.')}</p>
            <Button asChild className="relative mt-5 w-full">
              <Link to={mode === 'none' ? '/start' : '/app'}>
                {t('Build My Orbit', 'Bangun Orbit Saya')} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Orbit © 2026</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Smart Education & Campus Innovation</span>
            <span className="size-1 rounded-full bg-subtle-foreground" aria-hidden />
            <span className="inline-flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-sm bg-[#C5192D] text-[9px] font-bold text-white">4</span>
              {t('Supporting SDG 4', 'Mendukung SDG 4')}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

/** Section wrapper with consistent spacing and anchor offset. */
export function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn('relative scroll-mt-20 py-20 sm:py-28', className)}>
      {children}
    </section>
  );
}

export function SectionIntro({ eyebrow, title, desc, center, className }: { eyebrow: string; title: ReactNode; desc?: ReactNode; center?: boolean; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.6, ease }} className={cn('max-w-3xl', center && 'mx-auto text-center', className)}>
      <div className={cn('inline-flex items-center gap-2 rounded-full border border-green/25 bg-muted-green/60 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.1em] text-green-strong dark:text-green')}>
        <span className="size-1.5 rounded-full bg-green" />
        {eyebrow}
      </div>
      <h2 className="mt-4 font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-[42px] lg:text-[48px]">{title}</h2>
      {desc && <p className={cn('mt-4 text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]', center && 'mx-auto max-w-2xl')}>{desc}</p>}
    </motion.div>
  );
}
