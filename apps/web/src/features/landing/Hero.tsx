import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, BookOpen, BookOpenText, BriefcaseBusiness, GraduationCap, Lightbulb, MousePointerClick, PlayCircle, Route, School, ShieldCheck, Sparkles, Target, Users, Languages, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReadinessRing } from '@/components/brand/brand';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { scrollToId } from './chrome';
import { Sdg4Mark } from './MissionSection';

interface HNode {
  id: string;
  label: { en: string; id: string };
  icon: LucideIcon;
  x: number; // % of box
  y: number;
  tone: 'green' | 'orange' | 'dark' | 'soft';
  kind: { en: string; id: string };
}

const NODES: HNode[] = [
  { id: 'pm', label: { en: 'Product Manager', id: 'Product Manager' }, icon: Target, x: 50, y: 9, tone: 'dark', kind: { en: 'Target role', id: 'Peran target' } },
  { id: 'pa', label: { en: 'Product Analytics', id: 'Product Analytics' }, icon: Target, x: 83, y: 27, tone: 'orange', kind: { en: 'Priority gap', id: 'Gap prioritas' } },
  { id: 'sql', label: { en: 'SQL Course', id: 'Kursus SQL' }, icon: BookOpen, x: 17, y: 25, tone: 'green', kind: { en: 'Learning', id: 'Belajar' } },
  { id: 'lead', label: { en: 'Leadership', id: 'Kepemimpinan' }, icon: Lightbulb, x: 8, y: 57, tone: 'green', kind: { en: 'Strength', id: 'Kekuatan' } },
  { id: 'intern', label: { en: 'Internship', id: 'Magang' }, icon: BriefcaseBusiness, x: 90, y: 63, tone: 'orange', kind: { en: '92% match', id: '92% cocok' } },
  { id: 'mentor', label: { en: 'Mentor', id: 'Mentor' }, icon: Users, x: 24, y: 86, tone: 'soft', kind: { en: 'People', id: 'Orang' } },
  { id: 'quest', label: { en: 'Case Study Quest', id: 'Quest Studi Kasus' }, icon: Route, x: 66, y: 91, tone: 'green', kind: { en: 'In progress', id: 'Berjalan' } },
  { id: 'class', label: { en: 'Statistics class', id: 'Kelas Statistika' }, icon: GraduationCap, x: 79, y: 9, tone: 'green', kind: { en: 'Campus course → Analytics', id: 'Mata kuliah → Analitik' } },
];

function HeroOrbit() {
  const { t, l } = useT();
  const [hover, setHoverState] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Moving between neighbouring nodes must not flash the "nothing hovered" state.
  const setHover = (id: string | null) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (id) setHoverState(id);
    else leaveTimer.current = setTimeout(() => setHoverState(null), 140);
  };
  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" onMouseLeave={() => setHover(null)}>
      {/* Glow */}
      <div className="absolute inset-[20%] rounded-full bg-green/20 blur-3xl" aria-hidden />
      <div className="absolute inset-[35%] translate-x-[30%] rounded-full bg-orange/15 blur-3xl" aria-hidden />
      {/* Rotating orbits */}
      {[
        { inset: '30%', dur: 40 },
        { inset: '17%', dur: 70, rev: true },
        { inset: '4%', dur: 110 },
      ].map((r, i) => (
        <div key={i} className="absolute rounded-full border border-dashed border-border-strong" style={{ inset: r.inset, animation: `orbit-spin ${r.dur}s linear infinite ${r.rev ? 'reverse' : ''}` }} aria-hidden>
          <span className={cn('absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full', i === 1 ? 'bg-orange shadow-orange' : 'bg-green shadow-green')} />
        </div>
      ))}
      {/* Connections */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id="hl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0AB46A" />
            <stop offset="1" stopColor="#FB9002" />
          </linearGradient>
        </defs>
        {NODES.map((n, i) => {
          const on = hover === n.id;
          const dim = hover !== null && !on;
          return (
            <g key={n.id}>
              {/* Base line: draws in once, then only its opacity changes. */}
              <motion.line
                x1="50"
                y1="50"
                x2={n.x}
                y2={n.y}
                stroke="var(--border-strong)"
                strokeWidth={0.28}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 + i * 0.08, ease }}
                style={{ opacity: dim ? 0.3 : 1, transition: 'opacity 300ms cubic-bezier(0.22,1,0.36,1)' }}
              />
              {/* Highlight line: always mounted, fades in with a seamless flowing dash. */}
              <line
                x1="50"
                y1="50"
                x2={n.x}
                y2={n.y}
                stroke="url(#hl)"
                strokeWidth={0.6}
                strokeLinecap="round"
                strokeDasharray="1.5 1.5"
                className="hero-flow"
                style={{ opacity: on ? 1 : 0, transition: 'opacity 300ms cubic-bezier(0.22,1,0.36,1)' }}
              />
            </g>
          );
        })}
      </svg>
      {/* Center */}
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease, delay: 0.2 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-green/35" aria-hidden />
        <div className="orbit-gradient relative flex size-[92px] items-center justify-center rounded-full font-display text-[20px] font-extrabold text-white shadow-[0_20px_50px_-14px_rgba(10,180,106,0.85)] ring-[6px] ring-surface sm:size-[110px] sm:text-[22px]">
          {t('YOU', 'KAMU')}
        </div>
      </motion.div>
      {/* Nodes */}
      {NODES.map((n, i) => {
        const on = hover === n.id;
        const dim = hover !== null && !on;
        return (
          <motion.button
            key={n.id}
            type="button"
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n.id)}
            onBlur={() => setHover(null)}
            onClick={() => setHover(on ? null : n.id)}
            // Entrance only — hover styling is handled by CSS so it never re-runs this animation.
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease, delay: 0.6 + i * 0.07 }}
            className={cn('absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none', on && 'z-10')}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            aria-label={`${l(n.label)} — ${l(n.kind)}`}
          >
            <span style={{ display: 'block', animation: `float ${6 + (i % 3)}s ease-in-out ${i * 0.4}s infinite` }}>
            <span
              className={cn(
                'relative flex items-center gap-2 whitespace-nowrap rounded-full border bg-surface p-1.5 sm:pr-3 transition-[opacity,transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                on ? 'scale-[1.06] border-green/40 shadow-hover' : 'border-border shadow-card',
                dim && 'opacity-45',
              )}
            >
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full',
                  n.tone === 'green' && 'bg-green text-white',
                  n.tone === 'orange' && 'bg-orange text-white',
                  n.tone === 'dark' && 'bg-[#13201a] text-white dark:bg-[#e7efea] dark:text-[#13201a]',
                  n.tone === 'soft' && 'bg-surface-2 text-muted-foreground',
                )}
              >
                <n.icon className="size-3.5" />
              </span>
              <span className="hidden text-[13px] font-semibold sm:inline">{l(n.label)}</span>
              {/* Kind label floats below the pill so the node never changes width under the cursor. */}
              <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#13201a] px-2 py-0.5 text-[11px] font-semibold text-white transition-[opacity,transform] duration-200 dark:bg-[#e7efea] dark:text-[#13201a]',
                  on ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                )}
                aria-hidden
              >
                <span className="sm:hidden">{l(n.label)} · </span>
                {l(n.kind)}
              </span>
            </span>
            </span>
          </motion.button>
        );
      })}
      {/* Floating cards */}
      <motion.div initial={{ opacity: 0, y: 20, x: -10 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ duration: 0.7, ease, delay: 1.2 }} className="absolute -left-2 top-[34%] hidden sm:block lg:-left-10">
        <div className="glass flex items-center gap-3 rounded-2xl border border-border p-3 pr-4 shadow-pop" style={{ animation: 'float 7s ease-in-out infinite' }}>
          <ReadinessRing score={74} size={58} stroke={6} showBand={false} />
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{t('Readiness', 'Kesiapan')}</div>
            <div className="text-[14px] font-bold">Product Manager</div>
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 1.45 }} className="absolute -bottom-6 right-0 w-[270px] sm:-right-4 lg:-right-10">
        <div className="glass rounded-2xl border border-border p-4 shadow-pop" style={{ animation: 'float 8s ease-in-out 1s infinite' }}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-orange-strong dark:text-orange">
            <Sparkles className="size-3.5" /> Next Best Action
          </div>
          <div className="mt-1.5 text-[14.5px] font-bold leading-snug">{t('Complete Product Analytics Foundations', 'Selesaikan Product Analytics Foundations')}</div>
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">{t('Estimated readiness impact', 'Perkiraan dampak kesiapan')}</span>
            <span className="tabular rounded-full bg-muted-green px-2 py-0.5 font-bold text-green-strong dark:text-green">+4.2%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function Hero() {
  const { t } = useT();
  const mode = useOrbit((s) => s.mode);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 80]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  const words = t('Every lesson, aimed at your future.', 'Setiap pelajaran, terarah ke masa depanmu.').split(' ');

  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_30%,transparent_75%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-40 top-20 size-[520px] rounded-full bg-green/12 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-40 size-[460px] rounded-full bg-orange/10 blur-3xl" aria-hidden />
      <div className="container-orbit relative grid items-center gap-14 lg:grid-cols-[1.02fr_1fr] lg:gap-10">
        <motion.div style={{ y, opacity }}>
          <motion.button
            type="button"
            onClick={() => scrollToId('sdg')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="group inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3.5 text-left text-[13px] font-semibold shadow-xs transition hover:border-border-strong hover:shadow-card"
          >
            <Sdg4Mark size="sm" className="rounded-full" />
            <span className="min-w-0 truncate">
              <span className="text-muted-foreground">{t('Supports SDG 4 · ', 'Mendukung SDG 4 · ')}</span>
              {t('Smart Education & Campus Innovation', 'Smart Education & Inovasi Kampus')}
            </span>
            <ArrowRight className="size-3.5 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5" />
          </motion.button>
          <h1 className="mt-6 font-display text-[46px] font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-[64px] lg:text-[72px]">
            {words.map((w, i) => {
              const accent = i >= words.length - 4;
              return (
                <motion.span key={i} initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.07 }} className={cn('mr-[0.22em] inline-block', accent && 'orbit-gradient-text pb-1')}>
                  {w}
                </motion.span>
              );
            })}
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.55 }} className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
            {t('Orbit is a goal-centred learning system for students, fresh graduates and job seekers.', 'Orbit adalah sistem belajar yang berpusat pada tujuan untuk siswa, mahasiswa, fresh graduate, dan pencari kerja.')}{' '}
            <strong className="font-semibold text-foreground">{t('It connects what you learn in class to the skills, roadmap and opportunities of the career you want — so you learn smarter, not just more.', 'Orbit menghubungkan apa yang kamu pelajari di kelas dengan skill, roadmap, dan peluang dari karier yang kamu inginkan — supaya kamu belajar lebih cerdas, bukan sekadar lebih banyak.')}</strong>
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.68 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="xl" asChild>
              <Link to={mode === 'none' ? '/start' : '/app'}>
                {t('Build My Orbit', 'Bangun Orbit Saya')} <ArrowRight />
              </Link>
            </Button>
            <Button size="xl" variant="secondary" onClick={() => scrollToId('flow')}>
              {t('Explore How It Works', 'Lihat Cara Kerjanya')}
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.85 }} className="mt-5 flex flex-col items-start gap-2.5">
            <Link to="/start?demo=1" className="group inline-flex items-center gap-2 text-[14px] font-semibold text-green-strong dark:text-green">
              <PlayCircle className="size-[18px]" />
              {t('Try the 2-minute demo as Naya — no sign-up', 'Coba demo 2 menit sebagai Naya — tanpa daftar')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/why-orbit" className="group inline-flex items-center gap-2 text-[14px] font-semibold text-muted-foreground transition hover:text-foreground">
              <BookOpenText className="size-[18px] text-orange" />
              {t('Why Orbit? See the data and Naya’s story', 'Kenapa Orbit? Lihat data dan cerita Naya')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1 }} className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[13.5px] text-muted-foreground">
            {[
              { icon: School, l: t('Complements your school & lecturers', 'Melengkapi sekolah & dosenmu') },
              { icon: Sparkles, l: t('Explainable readiness score', 'Skor kesiapan yang dijelaskan') },
              { icon: ShieldCheck, l: t('Asks before changing your plan', 'Bertanya sebelum mengubah rencana') },
              { icon: Languages, l: 'English & Bahasa Indonesia' },
            ].map((x) => (
              <li key={x.l} className="flex items-center gap-2">
                <x.icon className="size-4 text-green" /> {x.l}
              </li>
            ))}
          </motion.ul>
        </motion.div>
        <div className="relative mt-6 sm:mt-0">
          <HeroOrbit />
          <p className="mt-10 flex items-center justify-center gap-1.5 text-[12.5px] text-subtle-foreground lg:mt-12">
            <MousePointerClick className="size-3.5" /> {t('Hover a node to trace its connection', 'Arahkan ke node untuk melihat koneksinya')}
          </p>
        </div>
      </div>
    </section>
  );
}
