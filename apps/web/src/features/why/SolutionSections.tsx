import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Building2, Check, Compass, Link2, MessageSquareQuote, RotateCw, School, Unlink, Puzzle, type LucideIcon } from 'lucide-react';
import { OrbitMark } from '@/components/brand/brand';
import { Button } from '@/components/ui/button';
import { useOrbit } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { STORY_PATH, useStoryReturn } from '@/store/story';
import { useT, type Text } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { PILLARS, STAGES, type Demo } from './data';
import { Chapter, Heading, Lead } from './parts';

/** Opens a live feature while remembering exactly where the reader was on this page. */
function useDemoLauncher() {
  const navigate = useNavigate();
  const mode = useOrbit((s) => s.mode);
  const loadDemo = useOrbit((s) => s.loadDemo);
  const openAgent = useUi((s) => s.openAgent);
  const save = useStoryReturn((s) => s.save);
  const { t } = useT();
  return (demo: Pick<Demo, 'to' | 'agent'>, label: Text, pillar?: string) => {
    save({ path: STORY_PATH, label, pillar, scrollY: window.scrollY });
    if (demo.to.startsWith('/app') && mode === 'none') {
      loadDemo();
      toast.success(t('Opened as Naya — demo profile', 'Dibuka sebagai Naya — profil demo'), { description: t('Your place on Why Orbit is saved.', 'Posisimu di Why Orbit sudah tersimpan.') });
    }
    if (demo.agent) openAgent();
    navigate(demo.to);
  };
}

// ─────────────────────────────────────────────────────────── 05 · Orbit arrives

export function OrbitArrivesSection() {
  const { t } = useT();
  const shifts: { from: string; to: string; icon: LucideIcon; fromIcon: LucideIcon }[] = [
    { fromIcon: Compass, icon: Compass, from: t('No destination', 'Tanpa tujuan'), to: t('A clear direction', 'Arah yang jelas') },
    { fromIcon: Unlink, icon: Link2, from: t('No connection', 'Tanpa koneksi'), to: t('Learning that’s relevant', 'Belajar yang relevan') },
    { fromIcon: Puzzle, icon: RotateCw, from: t('No support system', 'Tanpa sistem pendukung'), to: t('One connected ecosystem', 'Satu ekosistem terhubung') },
  ];
  return (
    <section id="orbit" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-mint via-background to-background py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_65%)]" aria-hidden />
      <div className="container-orbit relative text-center">
        <Chapter n="05" label={t('The answer', 'Jawabannya')} center />
        <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -30 }} whileInView={{ scale: 1, opacity: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease }} className="relative mx-auto mt-10 flex size-36 items-center justify-center">
          {[0, 0.8, 1.6].map((d) => (
            <span key={d} className="absolute inset-4 animate-pulse-ring rounded-full bg-green/25" style={{ animationDelay: `${d}s` }} aria-hidden />
          ))}
          <span className="absolute inset-0 rounded-full border border-dashed border-green/40 animate-orbit-spin" aria-hidden>
            <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange shadow-orange" />
          </span>
          <OrbitMark className="relative size-24 drop-shadow-[0_24px_40px_rgba(10,180,106,0.5)]" animated />
        </motion.div>
        <Heading center>
          {t('Then,', 'Lalu,')} <span className="orbit-gradient-text">{t('Orbit arrives.', 'Orbit hadir.')}</span>
        </Heading>
        <Lead center>
          {t('A goal-centred learning system that connects every lesson, skill and opportunity to the career you’re aiming for.', 'Sistem belajar yang berpusat pada tujuan — menghubungkan setiap pelajaran, skill, dan peluang dengan karier yang kamu tuju.')}
        </Lead>

        <motion.ul variants={stagger(0.12)} {...reveal} className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
          {shifts.map((s) => (
            <motion.li key={s.to} variants={fadeUp} className="card p-5 text-left">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-subtle-foreground line-through decoration-danger/60 decoration-2">
                <s.fromIcon className="size-4 shrink-0 no-underline" aria-hidden /> {s.from}
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-green text-white shadow-green">
                  <s.icon className="size-4" />
                </span>
                <span className="font-display text-[17px] font-bold leading-tight">{s.to}</span>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mx-auto mt-8 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-left text-[13.5px] font-medium text-muted-foreground shadow-xs">
          <School className="size-4 shrink-0 text-green" />
          {t('Not a replacement for schools, campuses or lecturers — Orbit completes them.', 'Bukan pengganti sekolah, kampus, atau dosen — Orbit melengkapinya.')}
        </motion.p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────── 06 · Pillars

const R = 40; // planet orbit radius, % of the box

function planetPos(i: number) {
  const a = ((-90 + i * (360 / PILLARS.length)) * Math.PI) / 180;
  return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
}

function OrbitSystem({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const { t, l } = useT();
  const p = PILLARS[active];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]">
      <div className="absolute inset-[22%] rounded-full blur-3xl transition-colors duration-700" style={{ background: `${p.color}2e` }} aria-hidden />
      {/* Rings */}
      <div className="absolute inset-[9%] rounded-full border border-border-strong" aria-hidden />
      <div className="absolute inset-[24%] rounded-full border border-dashed border-border-strong animate-orbit-spin" aria-hidden>
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange shadow-orange" />
      </div>
      <div className="absolute inset-[34%] rounded-full border border-dashed border-border [animation:orbit-spin_40s_linear_infinite_reverse]" aria-hidden>
        <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-green" />
      </div>

      {/* Spokes */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id="why-spoke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0AB46A" />
            <stop offset="1" stopColor="#FB9002" />
          </linearGradient>
        </defs>
        {PILLARS.map((_, i) => {
          const { x, y } = planetPos(i);
          const on = i === active;
          return (
            <g key={i}>
              <line x1="50" y1="50" x2={x} y2={y} stroke="var(--border-strong)" strokeWidth={0.25} style={{ opacity: on ? 0 : 0.8, transition: 'opacity 300ms' }} />
              <line x1="50" y1="50" x2={x} y2={y} stroke="url(#why-spoke)" strokeWidth={0.6} strokeLinecap="round" strokeDasharray="1.5 1.5" className="hero-flow" style={{ opacity: on ? 1 : 0, transition: 'opacity 300ms' }} />
            </g>
          );
        })}
      </svg>

      {/* Core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-green/30" aria-hidden />
        <div className="orbit-gradient relative flex size-[96px] flex-col items-center justify-center rounded-full text-white shadow-[0_20px_50px_-14px_rgba(10,180,106,0.85)] ring-[6px] ring-surface sm:size-[120px]">
          <OrbitMark plate className="size-10 sm:size-12" />
          <span className="mt-1 font-display text-[13px] font-extrabold tracking-tight sm:text-[15px]">Orbit</span>
        </div>
      </div>

      {/* Planets */}
      <div role="tablist" aria-label={t('Orbit pillars', 'Pilar Orbit')}>
        {PILLARS.map((pl, i) => {
          const { x, y } = planetPos(i);
          const on = i === active;
          return (
            <motion.button
              key={pl.id}
              type="button"
              role="tab"
              id={`pillar-tab-${pl.id}`}
              aria-selected={on}
              aria-controls="pillar-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(i)}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.08 }}
              className="group absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="flex flex-col items-center" style={{ animation: `float ${6 + (i % 3)}s ease-in-out ${i * 0.5}s infinite` }}>
                <span
                  className={cn(
                    'relative flex size-14 items-center justify-center rounded-full border transition-[transform,box-shadow,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-visible:ring-4 group-focus-visible:ring-[var(--ring)] sm:size-[72px]',
                    on ? 'scale-110 border-transparent text-white' : 'border-border bg-surface shadow-card group-hover:scale-105 group-hover:shadow-hover',
                  )}
                  style={on ? { background: pl.color, boxShadow: `0 16px 34px -12px ${pl.color}`, color: '#fff' } : { color: pl.color }}
                >
                  {on && <span className="absolute -inset-1.5 rounded-full border-2 opacity-40" style={{ borderColor: pl.color }} aria-hidden />}
                  <pl.icon className="size-6 sm:size-7" />
                  <span className={cn('tabular absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-surface sm:size-6 sm:text-[11px]', on ? 'bg-[#13201a] text-white dark:bg-white dark:text-[#13201a]' : 'bg-surface-2 text-muted-foreground')}>
                    {i + 1}
                  </span>
                </span>
                <span className={cn('mt-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-bold transition sm:text-[12.5px]', on ? 'bg-surface text-foreground shadow-card' : 'text-muted-foreground')}>{l(pl.verb)}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PillarDetail({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const { t, l } = useT();
  const launch = useDemoLauncher();
  const p = PILLARS[index];
  const prev = index > 0 ? PILLARS[index - 1] : null;
  const next = index < PILLARS.length - 1 ? PILLARS[index + 1] : null;
  const stage = STAGES[p.answers];
  const label: Text = { en: `Pillar ${p.n} · ${p.name.en}`, id: `Pilar ${p.n} · ${p.name.id}` };
  const [primary, ...more] = p.demos;

  return (
    <div id="pillar-panel" role="tabpanel" aria-labelledby={`pillar-tab-${p.id}`} className="card relative overflow-hidden">
      <motion.span className="absolute inset-x-0 top-0 h-1" animate={{ background: p.color }} transition={{ duration: 0.4 }} aria-hidden />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={p.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28, ease }} className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular rounded-full px-2.5 py-1 text-[12px] font-bold text-white" style={{ background: p.color }}>
              {t('Pillar', 'Pilar')} {p.n} / 0{PILLARS.length}
            </span>
            <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[12px] font-semibold">{p.feature}</span>
          </div>
          <h3 className="mt-4 font-display text-[28px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[34px]">{l(p.name)}</h3>

          <div className="mt-4 rounded-2xl border border-orange/25 bg-muted-orange/60 p-4">
            <div className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-orange-strong dark:text-orange">
              <MessageSquareQuote className="size-3.5" /> {t('Answers Naya’s problem', 'Menjawab masalah Naya')} · {l(stage.when)}
            </div>
            <p className="mt-1.5 text-[15px] font-semibold italic">{l(p.pain)}</p>
          </div>

          <p className="mt-5 text-[15.5px] leading-relaxed text-muted-foreground">{l(p.desc)}</p>
          <ul className="mt-4 space-y-2.5">
            {p.points.map((pt) => (
              <li key={pt.en} className="flex items-start gap-2.5 text-[14.5px] font-medium">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: p.color }}>
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {l(pt)}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button size="lg" onClick={() => launch(primary, label, p.id)}>
              <primary.icon /> {l(primary.label)} <ArrowUpRight />
            </Button>
            {more.map((d) => (
              <Button key={d.label.en} size="lg" variant="secondary" onClick={() => launch(d, label, p.id)}>
                <d.icon /> {l(d.label)}
              </Button>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-subtle-foreground">
            <Bookmark className="size-3.5" /> {t('Your place here is saved — come back in one click.', 'Posisimu di sini tersimpan — kembali dengan satu klik.')}
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/50 px-4 py-3 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => prev && onSelect(index - 1)} disabled={!prev} aria-label={t('Previous pillar', 'Pilar sebelumnya')}>
          <ArrowLeft /> <span className="hidden sm:inline">{prev ? l(prev.verb) : t('Previous', 'Sebelumnya')}</span>
        </Button>
        <div className="flex items-center gap-1.5" aria-hidden>
          {PILLARS.map((x, i) => (
            <span key={x.id} className={cn('h-1.5 rounded-full transition-all duration-300', i === index ? 'w-6' : 'w-1.5 bg-border-strong')} style={i === index ? { background: p.color } : undefined} />
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => next && onSelect(index + 1)} disabled={!next} aria-label={t('Next pillar', 'Pilar berikutnya')}>
          <span className="hidden sm:inline">{next ? l(next.verb) : t('Next', 'Berikutnya')}</span> <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export function SolutionSection() {
  const { t, l } = useT();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const launch = useDemoLauncher();
  const [active, setActive] = useState(() => {
    const r = useStoryReturn.getState().ret;
    const i = r?.path === STORY_PATH ? PILLARS.findIndex((p) => p.id === r.pillar) : -1;
    return Math.max(0, i);
  });

  // ← / → step through the pillars while this section is on screen.
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]') || document.querySelector('[role="dialog"]')) return;
      if (e.key === 'ArrowRight') setActive((i) => Math.min(PILLARS.length - 1, i + 1));
      else if (e.key === 'ArrowLeft') setActive((i) => Math.max(0, i - 1));
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView]);

  return (
    <section ref={ref} id="solution" className="relative scroll-mt-20 border-y border-border bg-surface-2/40 py-20 sm:py-28">
      <div className="container-orbit">
        <div className="grid items-end gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <Chapter n="06" label={t('The solution', 'Solusinya')} />
            <Heading>
              {t('Six pillars.', '6 pilar.')} <span className="orbit-gradient-text">{t('One connected system.', 'Satu sistem yang terhubung.')}</span>
            </Heading>
          </div>
          <Lead className="lg:mb-1">{t('Each pillar answers one of Naya’s problems. Tap a planet to explore it — then open the feature live.', 'Setiap pilar menjawab satu masalah Naya. Klik planet untuk melihat pilarnya — lalu buka fiturnya secara langsung.')}</Lead>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] [&>*]:min-w-0">
          <div className="pb-6 lg:pb-0">
            <OrbitSystem active={active} onSelect={setActive} />
            <p className="mt-2 hidden text-center text-[12.5px] text-subtle-foreground lg:block">{t('Tip: use ← → to move between pillars', 'Tips: gunakan ← → untuk berpindah pilar')}</p>
          </div>
          <PillarDetail index={active} onSelect={setActive} />
        </div>

        {/* The loop */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="mt-14">
          <div className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{t('One loop that keeps turning', 'Satu siklus yang terus berputar')}</div>
          <ol className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {PILLARS.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition', i === active ? 'border-transparent text-white shadow-card' : 'border-border bg-surface hover:border-border-strong')}
                  style={i === active ? { background: p.color } : undefined}
                >
                  <p.icon className="size-3.5" style={i === active ? undefined : { color: p.color }} />
                  {l(p.verb)}
                </button>
                {i < PILLARS.length - 1 ? <ArrowRight className="size-3.5 text-subtle-foreground" aria-hidden /> : <RotateCw className="size-4 text-green" aria-label={t('repeat', 'berulang')} />}
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-3 max-w-xl text-center text-[13.5px] text-muted-foreground">{t('Every quest you finish updates your readiness — and Orbit re-plans the next step.', 'Setiap quest yang selesai memperbarui kesiapanmu — dan Orbit menyusun ulang langkah berikutnya.')}</p>
        </motion.div>

        {/* Campus extension */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="relative mt-12 overflow-hidden rounded-[24px] bg-[#0f1d16] p-6 text-white shadow-pop sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-green/35 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Building2 className="size-6 text-green" />
              </span>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/55">{t('Plus · Campus innovation', 'Plus · Inovasi kampus')}</div>
                <h3 className="mt-1 font-display text-[22px] font-bold leading-snug text-white">Orbit for Campus</h3>
                <p className="mt-1 max-w-xl text-[14.5px] text-white/65">{t('Lecturers, advisors and career centres see aggregate skill gaps and plan the programs that lift readiness most — privately.', 'Dosen, pembimbing akademik, dan career center melihat gap skill agregat dan merencanakan program yang paling meningkatkan kesiapan — tetap privat.')}</p>
              </div>
            </div>
            <Button size="lg" className="shrink-0" onClick={() => launch({ to: '/campus' }, { en: 'Orbit for Campus', id: 'Orbit for Campus' }, PILLARS[active].id)}>
              {t('Open Orbit for Campus', 'Buka Orbit for Campus')} <ArrowUpRight />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
