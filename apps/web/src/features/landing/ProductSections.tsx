import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Compass,
  FolderKanban,
  Gauge,
  GraduationCap,
  Languages,
  Layers,
  Library,
  Loader2,
  Orbit as OrbitIcon,
  Presentation,
  RotateCcw,
  Rocket,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrbitMark, ReadinessRing } from '@/components/brand/brand';
import { FilterChips } from '@/components/ui/tabs';
import { COURSE_BY_ID, courseRelevance } from '@/data/courses';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { Section, SectionIntro } from './chrome';

// ─────────────────────────────────────────────────────────── Universe preview

type PFilter = 'all' | 'skills' | 'opportunities' | 'learning' | 'people';
interface PNode {
  id: string;
  label: string;
  group: Exclude<PFilter, 'all'>;
  x: number;
  y: number;
  gap?: boolean;
  icon: LucideIcon;
  detail: { en: string; id: string };
  stat: string;
}

const PNODES: PNode[] = [
  { id: 'pa', label: 'Product Analytics', group: 'skills', x: 70, y: 20, gap: true, icon: Target, detail: { en: 'Your biggest gap — required by 8 matching openings.', id: 'Gap terbesarmu — dibutuhkan 8 lowongan yang cocok.' }, stat: '96%' },
  { id: 'ps', label: 'Product Strategy', group: 'skills', x: 30, y: 16, gap: true, icon: Target, detail: { en: 'Core skill for PM roles. You are Intermediate, target Advanced.', id: 'Skill inti untuk PM. Kamu Menengah, target Mahir.' }, stat: '92%' },
  { id: 'comm', label: 'Communication', group: 'skills', x: 12, y: 46, icon: Layers, detail: { en: 'A strength — already at the level openings expect.', id: 'Kekuatanmu — sudah di level yang diharapkan.' }, stat: '84%' },
  { id: 'lead', label: 'Leadership', group: 'skills', x: 20, y: 78, icon: Layers, detail: { en: 'Proven by your role leading 14 people in student government.', id: 'Terbukti dari peranmu memimpin 14 orang di BEM.' }, stat: '68%' },
  { id: 'int', label: 'PM Internship', group: 'opportunities', x: 88, y: 48, icon: BriefcaseBusiness, detail: { en: '92% match. Uses 5 of your skills and closes your Product Strategy gap.', id: '92% cocok. Memakai 5 skill-mu dan menutup gap Product Strategy.' }, stat: '92%' },
  { id: 'apm', label: 'Associate PM', group: 'opportunities', x: 78, y: 82, icon: BriefcaseBusiness, detail: { en: 'Graduate program with rotations. Strong fit after Product Analytics.', id: 'Program lulusan dengan rotasi. Sangat cocok setelah Product Analytics.' }, stat: '89%' },
  { id: 'course', label: 'Analytics Foundations', group: 'learning', x: 52, y: 6, icon: BookOpen, detail: { en: 'Closes your top gap. Estimated +4.2% readiness.', id: 'Menutup gap utamamu. Perkiraan +4,2% kesiapan.' }, stat: '+4.2%' },
  { id: 'book', label: 'Inspired', group: 'learning', x: 46, y: 92, icon: BookOpen, detail: { en: 'Halfway through — the product discovery classic.', id: 'Sudah setengah — buku klasik product discovery.' }, stat: '50%' },
  { id: 'ayu', label: 'Ayu Lestari', group: 'people', x: 92, y: 18, icon: Users, detail: { en: 'Product Analytics Lead — mentors on metrics and experiments.', id: 'Product Analytics Lead — mentor metrik dan eksperimen.' }, stat: '4.8★' },
  { id: 'event', label: 'Metrics Talk', group: 'people', x: 6, y: 18, icon: CalendarDays, detail: { en: 'Live session with three product leads in 4 days.', id: 'Sesi langsung bersama tiga product lead dalam 4 hari.' }, stat: '4d' },
];

export function UniversePreview() {
  const { t, l } = useT();
  const [filter, setFilter] = useState<PFilter>('all');
  const [sel, setSel] = useState<string>('pa');
  const node = PNODES.find((n) => n.id === sel)!;
  return (
    <Section id="universe">
      <div className="container-orbit">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
          <SectionIntro eyebrow="Career Universe" title={t('Everything connected to your career — in one living map.', 'Semua yang terhubung dengan kariermu — dalam satu peta hidup.')} desc={t('Skills, opportunities, learning and people orbit around you. Click a node to see why it matters.', 'Skill, peluang, pembelajaran, dan orang mengorbit di sekitarmu. Klik node untuk melihat kenapa itu penting.')} />
          <div className="lg:pb-2">
            <FilterChips
              label={t('Filter', 'Filter')}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: t('All', 'Semua') },
                { value: 'skills', label: t('Skills', 'Skill') },
                { value: 'opportunities', label: t('Opportunities', 'Peluang') },
                { value: 'learning', label: t('Learning', 'Belajar') },
                { value: 'people', label: t('People', 'Orang') },
              ]}
            />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.7, ease }} className="mt-10 grid overflow-hidden rounded-[28px] border border-border bg-surface shadow-hover lg:grid-cols-[1.5fr_1fr]">
          <div className="relative aspect-[4/3] min-h-[340px] overflow-hidden bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--orbit-green)_10%,transparent),transparent_60%)] sm:aspect-[16/11]">
            <div className="absolute inset-0 grid-dots opacity-60" aria-hidden />
            {[36, 64, 92].map((s, i) => (
              <div key={s} className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-green/25" style={{ width: `${s}%`, aspectRatio: '1', transform: 'translate(-50%,-50%)', animation: `orbit-spin ${80 + i * 30}s linear infinite` }} aria-hidden />
            ))}
            <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {PNODES.map((n) => {
                const vis = filter === 'all' || n.group === filter;
                const on = n.id === sel;
                return <line key={n.id} x1="50" y1="50" x2={n.x} y2={n.y} stroke={on ? (n.gap ? '#FB9002' : '#0AB46A') : 'var(--border-strong)'} strokeWidth={on ? 0.5 : 0.25} strokeDasharray={on ? '0' : '1 1'} opacity={vis ? 1 : 0.15} vectorEffect="non-scaling-stroke" style={{ transition: 'stroke 300ms ease, stroke-width 300ms ease, opacity 300ms ease' }} />;
              })}
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="orbit-gradient flex size-16 items-center justify-center rounded-full font-display text-[14px] font-extrabold text-white shadow-green ring-4 ring-surface sm:size-20">NAYA</div>
            </div>
            {PNODES.map((n, i) => {
              const vis = filter === 'all' || n.group === filter;
              const on = n.id === sel;
              return (
                <motion.button
                  key={n.id}
                  type="button"
                  onClick={() => setSel(n.id)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4, ease }}
                  className={cn('absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-opacity duration-300 focus-visible:outline-none', !vis && 'pointer-events-none opacity-20')}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  aria-pressed={on}
                  aria-label={n.label}
                >
                  <span className={cn('flex size-10 items-center justify-center rounded-full text-white shadow-card ring-[3px] ring-surface transition-transform', n.gap ? 'bg-orange' : n.group === 'opportunities' ? 'bg-[#13201a] dark:bg-[#e7efea] dark:text-[#13201a]' : n.group === 'learning' ? 'bg-[#0f8a55]' : n.group === 'people' ? 'bg-violet' : 'bg-green', on && 'scale-125 ring-[5px]')}>
                    <n.icon className="size-4" />
                  </span>
                  <span className="hidden whitespace-nowrap rounded-md bg-surface/85 px-1.5 text-[11.5px] font-semibold sm:block">{n.label}</span>
                </motion.button>
              );
            })}
          </div>
          <div className="flex flex-col border-t border-border p-6 sm:p-8 lg:border-l lg:border-t-0">
            <AnimatePresence mode="wait">
              <motion.div key={sel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease }} className="flex-1">
                <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[12px] font-bold', node.gap ? 'bg-muted-orange text-orange-strong dark:text-orange' : 'bg-muted-green text-green-strong dark:text-green')}>
                  {node.gap ? t('Skill gap', 'Gap skill') : node.group === 'opportunities' ? t('Opportunity', 'Peluang') : node.group === 'learning' ? t('Learning', 'Belajar') : node.group === 'people' ? t('People & events', 'Orang & event') : t('Strength', 'Kekuatan')}
                </span>
                <h3 className="mt-3 font-display text-[26px] font-extrabold tracking-tight">{node.label}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{l(node.detail)}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="tabular font-display text-[40px] font-extrabold leading-none tracking-tight text-green-strong dark:text-green">{node.stat}</span>
                  <span className="mb-1 text-[13px] text-muted-foreground">{node.group === 'skills' ? t('relevance', 'relevansi') : node.group === 'opportunities' ? t('match', 'kecocokan') : ''}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <Button asChild className="mt-8 self-start">
              <Link to="/start?demo=1">
                <OrbitIcon /> {t('Open the full Universe', 'Buka Universe lengkap')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────── Journey preview

export function JourneyPreview() {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 40%'] });
  const path = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const [col, setCol] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setCol((c) => (c + 1) % 4), 1700);
    return () => clearInterval(id);
  }, [inView]);
  const stages = [t('Discover', 'Kenali'), t('Build Foundation', 'Bangun Fondasi'), t('Gain Experience', 'Raih Pengalaman'), t('Prove Skills', 'Buktikan Skill'), t('Prepare to Apply', 'Siap Melamar'), t('Apply', 'Melamar')];
  const cols = [t('To do', 'To do'), t('In progress', 'Berjalan'), t('Completed', 'Selesai')];
  const pos = Math.min(col, 2);

  return (
    <Section id="journey" className="overflow-hidden bg-surface-2/40">
      <div ref={ref} className="container-orbit grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionIntro eyebrow={t('Adaptive Career Journey', 'Adaptive Career Journey')} title={t('A learning roadmap that moves when you do.', 'Roadmap belajar yang bergerak bersamamu.')} desc={t('Six stages from discovery to your first application. Switch between Roadmap and Kanban, drag quests forward, and watch readiness respond.', 'Enam tahap dari eksplorasi hingga lamaran pertama. Beralih antara Roadmap dan Kanban, seret quest ke depan, dan lihat kesiapanmu naik.')} />
          <div className="relative mt-10">
            <svg viewBox="0 0 400 120" className="w-full" aria-hidden>
              <path d="M10 90 C 70 90, 70 30, 130 30 S 200 90, 260 90 S 330 30, 390 30" stroke="var(--surface-3)" strokeWidth="6" fill="none" strokeLinecap="round" />
              <motion.path d="M10 90 C 70 90, 70 30, 130 30 S 200 90, 260 90 S 330 30, 390 30" stroke="url(#jp)" strokeWidth="6" fill="none" strokeLinecap="round" style={{ pathLength: path }} />
              <defs>
                <linearGradient id="jp" x1="0" x2="1">
                  <stop offset="0" stopColor="#0AB46A" />
                  <stop offset="1" stopColor="#FB9002" />
                </linearGradient>
              </defs>
            </svg>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {stages.map((s, i) => (
                <motion.div key={s} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white', i < 2 ? 'bg-green' : i === 2 ? 'bg-orange' : 'bg-border-strong')}>{i < 2 ? <Check className="size-3" strokeWidth={3} /> : i + 1}</span>
                  <span className="truncate">{s}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="grid grid-cols-3 gap-3 rounded-[28px] border border-border bg-surface p-3 shadow-hover sm:p-4">
            {cols.map((c, ci) => (
              <div key={c} className="min-h-[300px] rounded-2xl bg-surface-2/70 p-2.5">
                <div className="mb-3 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span className={cn('size-1.5 rounded-full', ci === 0 ? 'bg-subtle-foreground' : ci === 1 ? 'bg-orange' : 'bg-green')} />
                  <span className="truncate">{c}</span>
                </div>
                <div className="space-y-2">
                  {ci === pos && (
                    <motion.div layoutId="jp-card" transition={{ type: 'spring', stiffness: 260, damping: 28 }} className={cn('rounded-xl border bg-surface p-2.5 shadow-card', ci === 2 ? 'border-green/50' : ci === 1 ? 'border-orange/50' : 'border-border')}>
                      <div className="text-[11px] font-bold text-green-strong dark:text-green">{t('Build Foundation', 'Bangun Fondasi')}</div>
                      <div className="mt-1 text-[12.5px] font-semibold leading-snug">{t('Product Analytics Foundations', 'Product Analytics Foundations')}</div>
                      <div className="mt-2 flex items-center justify-between text-[10.5px] font-bold">
                        <span className="text-orange-strong dark:text-orange">180 XP</span>
                        {ci === 2 ? <Check className="size-3.5 text-green" /> : <span className="text-green-strong dark:text-green">+4.2%</span>}
                      </div>
                    </motion.div>
                  )}
                  {[0, 1].map((k) => (
                    <div key={k} className="rounded-xl border border-border bg-surface p-2.5 opacity-70">
                      <div className="h-1.5 w-12 rounded-full bg-surface-3" />
                      <div className="mt-2 h-1.5 w-full rounded-full bg-surface-3" />
                      <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-surface-3" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {col === 2 && (
              <motion.div initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.35, ease }} className="absolute -bottom-6 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-surface p-3 pr-4 shadow-pop">
                <span className="flex size-9 items-center justify-center rounded-xl bg-green text-white">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                <div>
                  <div className="text-[13px] font-bold">{t('Quest completed', 'Quest selesai')}</div>
                  <div className="text-[12px] text-muted-foreground">
                    <span className="font-bold text-orange-strong dark:text-orange">+180 XP</span> · {t('Career Readiness', 'Career Readiness')} <span className="font-bold text-green-strong dark:text-green">+4.2%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────── Orbit Intelligence

const STEPS = [
  { en: 'Reading career profile', id: 'Membaca profil karier' },
  { en: 'Mapping skills', id: 'Memetakan skill' },
  { en: 'Detecting career gaps', id: 'Mendeteksi gap karier' },
  { en: 'Searching opportunities', id: 'Mencari peluang' },
  { en: 'Building next best action', id: 'Menyusun next best action' },
];

export function IntelligenceSection() {
  const { t, l } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-25% 0px' });
  const [step, setStep] = useState(-1);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!inView) return;
    setStep(0);
  }, [inView, run]);
  useEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const id = setTimeout(() => setStep((s) => s + 1), 650);
    return () => clearTimeout(id);
  }, [step]);
  const done = step >= STEPS.length;

  return (
    <Section id="intelligence">
      <div ref={ref} className="container-orbit">
        <SectionIntro center eyebrow={t('Meet Orbit Intelligence', 'Kenali Orbit Intelligence')} title={t('Recommendations that explain themselves.', 'Rekomendasi yang menjelaskan dirinya sendiri.')} desc={t('Input → Processing → Intelligence → Recommendation → Action. Every suggestion comes with the context, the reason and the expected impact.', 'Input → Proses → Intelligence → Rekomendasi → Aksi. Setiap saran hadir dengan konteks, alasan, dan perkiraan dampaknya.')} />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <OrbitMark className="size-9" animated={!done} />
                <div>
                  <div className="font-display text-[15px] font-bold">Career Intelligence</div>
                  <div className="text-[12px] text-muted-foreground">{done ? t('Analysis complete', 'Analisis selesai') : t('Analysing Naya’s profile…', 'Menganalisis profil Naya…')}</div>
                </div>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={t('Run again', 'Jalankan lagi')}
                onClick={() => {
                  setStep(-1);
                  setRun((r) => r + 1);
                }}
              >
                <RotateCcw />
              </Button>
            </div>
            <ul className="mt-6 space-y-3">
              {STEPS.map((s, i) => {
                const st = i < step ? 'done' : i === step ? 'active' : 'idle';
                return (
                  <li key={s.en} className="flex items-center gap-3">
                    <span className={cn('flex size-7 items-center justify-center rounded-full transition-colors duration-300', st === 'done' ? 'bg-green text-white' : st === 'active' ? 'bg-muted-green text-green' : 'bg-surface-2 text-subtle-foreground')}>
                      {st === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : st === 'active' ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    <span className={cn('text-[14.5px] transition-colors', st === 'idle' ? 'text-subtle-foreground' : 'font-medium text-foreground')}>{l(s)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <motion.div className="orbit-gradient h-full rounded-full" animate={{ width: `${Math.max(0, Math.min(step, STEPS.length)) * 20}%` }} transition={{ duration: 0.5, ease }} />
            </div>
          </div>
          <div className="relative min-h-[340px]">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="r" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }} className="space-y-4">
                  <div className="card flex items-center gap-5 p-5">
                    <ReadinessRing score={74} size={96} stroke={9} showBand={false} />
                    <div className="grid flex-1 grid-cols-2 gap-3 text-[13px]">
                      <div>
                        <div className="text-muted-foreground">{t('Top strength', 'Kekuatan utama')}</div>
                        <div className="font-bold">{t('Projects · 82%', 'Proyek · 82%')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('Priority gap', 'Gap prioritas')}</div>
                        <div className="font-bold text-orange-strong dark:text-orange">{t('Interview · 60%', 'Wawancara · 60%')}</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-border bg-gradient-to-br from-mint to-cream p-5 shadow-card">
                    <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-green-strong dark:text-green">
                      <Sparkles className="size-3.5" /> Orbit Career Agent
                    </div>
                    <p className="mt-2 font-display text-[18px] font-bold leading-snug">{t('Your biggest gap right now is Product Analytics.', 'Gap terbesarmu saat ini adalah Product Analytics.')}</p>
                    <div className="mt-3 rounded-xl bg-surface/80 p-3 text-[13.5px]">
                      <span className="font-bold">{t('Why', 'Alasan')}:</span> <span className="text-muted-foreground">{t('It is required by 8 opportunities matching your Product Manager target.', 'Skill ini dibutuhkan 8 peluang yang cocok dengan target Product Manager-mu.')}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[13.5px]">
                        <span className="text-muted-foreground">{t('Next', 'Berikutnya')}:</span> <strong>Product Analytics Foundations</strong>
                      </div>
                      <span className="tabular rounded-full bg-surface px-2.5 py-1 text-[12.5px] font-bold text-green-strong shadow-xs dark:text-green">+4.2%</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <span className="inline-flex h-9 items-center gap-1.5 rounded-[11px] bg-green px-3.5 text-[13px] font-semibold text-white">
                        <Target className="size-4" /> {t('Add to Journey', 'Tambah ke Journey')}
                      </span>
                      <span className="inline-flex h-9 items-center rounded-[11px] border border-border bg-surface px-3.5 text-[13px] font-semibold">{t('Explore Alternatives', 'Lihat Alternatif')}</span>
                    </div>
                  </div>
                  <p className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    <ShieldCheck className="size-4 text-green" /> {t('Orbit asks for confirmation before changing your journey.', 'Orbit meminta konfirmasi sebelum mengubah journey-mu.')}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="s" exit={{ opacity: 0 }} className="space-y-4">
                  <div className="skeleton h-[136px] rounded-[20px]" />
                  <div className="skeleton h-[190px] rounded-[22px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────── Capabilities (bento)

export function CapabilitiesSection() {
  const { t, l } = useT();
  const tiles: { icon: LucideIcon; title: string; body: string; className?: string; accent?: 'green' | 'orange' | 'dark'; visual?: ReactNode }[] = [
    {
      icon: Gauge,
      title: t('Explainable Career Readiness', 'Career Readiness yang dijelaskan'),
      body: t('Six dimensions — skills, experience, projects, education, portfolio and interview — each with a reason and a next move.', 'Enam dimensi — skill, pengalaman, proyek, pendidikan, portofolio, dan wawancara — masing-masing dengan alasan dan langkah berikutnya.'),
      className: 'md:col-span-2',
      accent: 'green',
      visual: (
        <div className="mt-5 flex items-end gap-2">
          {[78, 65, 82, 88, 70, 60].map((v, i) => (
            <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: v }} viewport={{ once: true }} transition={{ duration: 0.8, ease, delay: i * 0.06 }} className={cn('w-full rounded-t-lg', v < 65 ? 'bg-orange' : 'bg-green')} style={{ opacity: 0.55 + v / 250 }} />
          ))}
        </div>
      ),
    },
    { icon: OrbitIcon, title: 'Career Universe', body: t('An interactive graph of everything connected to your goal.', 'Grafik interaktif dari semua yang terhubung dengan tujuanmu.'), accent: 'dark' },
    { icon: Compass, title: t('Opportunity Intelligence', 'Opportunity Intelligence'), body: t('Jobs, internships, courses, events and mentors — every match explained.', 'Pekerjaan, magang, kursus, event, dan mentor — setiap match dijelaskan.') },
    { icon: Route, title: t('Roadmap + Kanban Journey', 'Journey Roadmap + Kanban'), body: t('Drag quests forward; readiness, XP and streaks update instantly.', 'Seret quest ke depan; kesiapan, XP, dan streak langsung berubah.') },
    {
      icon: Sparkles,
      title: 'Orbit Career Agent',
      body: t('Context-aware guidance that knows your profile, journey and saved opportunities — and always asks before acting.', 'Panduan yang memahami profil, journey, dan peluang tersimpanmu — dan selalu bertanya sebelum bertindak.'),
      className: 'md:col-span-2',
      accent: 'orange',
      visual: (
        <div className="mt-5 space-y-2">
          <div className="ml-auto w-fit rounded-2xl rounded-tr-md bg-[#13201a] px-3.5 py-2 text-[13px] text-white dark:bg-surface-3">{t('What should I do next?', 'Apa yang harus saya lakukan?')}</div>
          <div className="w-fit max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-2 text-[13px]">
            {t('Complete Product Analytics Foundations — it unlocks 8 matching openings.', 'Selesaikan Product Analytics Foundations — membuka 8 lowongan yang cocok.')} <span className="font-bold text-green-strong dark:text-green">+4.2%</span>
          </div>
        </div>
      ),
    },
    { icon: Rocket, title: t('Multiple dream orbits', 'Banyak orbit impian'), body: t('Dream of more than one career? Each gets its own journey and readiness — switch in one tap.', 'Punya lebih dari satu impian karier? Masing-masing punya journey dan kesiapan sendiri — ganti dengan satu ketukan.') },
    {
      icon: GraduationCap,
      title: t('Learning Map', 'Learning Map'),
      body: t('Your whole curriculum, class by class, mapped to the career it powers — with an applied project and a question for your lecturer.', 'Seluruh kurikulummu, per mata kuliah, dipetakan ke karier yang didukungnya — lengkap dengan proyek terapan dan pertanyaan untuk dosen.'),
      className: 'md:col-span-2',
      accent: 'green',
      visual: (
        <ul className="mt-5 space-y-2.5">
          {['product-elective', 'system-analysis', 'statistics'].map((id, i) => {
            const c = COURSE_BY_ID[id];
            const v = courseRelevance(c, 'product-manager');
            return (
              <li key={id} className="grid grid-cols-[minmax(0,1fr)_88px_38px] items-center gap-3 text-[13px]">
                <span className="truncate font-medium">{l(c.name)}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <motion.span className={cn('block h-full rounded-full', v >= 70 ? 'bg-green' : 'bg-orange')} initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease, delay: i * 0.08 }} />
                </span>
                <span className="tabular text-right font-bold">{v}%</span>
              </li>
            );
          })}
        </ul>
      ),
    },
    {
      icon: Library,
      title: 'Knowledge Vault',
      body: t('Upload slides, notes, assignments and projects — or connect a link. Orbit finds the skills inside and plans what to study next.', 'Unggah slide, catatan, tugas, dan proyek — atau hubungkan tautan. Orbit menemukan skill di dalamnya dan merencanakan apa yang dipelajari berikutnya.'),
      className: 'md:col-span-2',
      accent: 'orange',
      visual: (
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-[12.5px]">
          <ul className="space-y-1.5">
            {['Statistika_W9.pptx', 'Tugas_SQL.sql', 'PRD_Project.docx'].map((f) => (
              <li key={f} className="truncate rounded-lg border border-border bg-surface px-2.5 py-1.5 font-medium">
                {f}
              </li>
            ))}
          </ul>
          <ArrowRight className="size-4 text-orange" aria-hidden />
          <ul className="space-y-1.5">
            {[['Statistics', 92], ['SQL', 94], [t('Product Docs', 'Dok. Produk'), 93]].map(([k, v]) => (
              <li key={k as string} className="flex items-center justify-between gap-2 rounded-lg bg-muted-green px-2.5 py-1.5 font-semibold text-green-strong dark:text-green">
                <span className="truncate">{k}</span>
                <span className="tabular">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    { icon: Users, title: 'Orbit for Campus', body: t('Aggregate insight for lecturers, advisors and career centers.', 'Insight agregat untuk dosen, pembimbing akademik, dan career center.') },
    { icon: Presentation, title: t('Complements educators', 'Melengkapi pendidik'), body: t('Teachers and lecturers keep teaching — Orbit shows learners why it matters.', 'Guru dan dosen tetap mengajar — Orbit menunjukkan kepada pelajar kenapa itu penting.') },
    { icon: Languages, title: t('Bilingual, light & dark', 'Bilingual, terang & gelap'), body: t('English and Bahasa Indonesia, with a carefully designed dark mode.', 'Bahasa Inggris dan Indonesia, dengan mode gelap yang dirancang cermat.') },
    { icon: FolderKanban, title: t('Works on every screen', 'Nyaman di semua layar'), body: t('Designed mobile-first with bottom navigation and touch-friendly sheets.', 'Dirancang mobile-first dengan navigasi bawah dan sheet yang ramah sentuhan.') },
  ];
  return (
    <Section id="capabilities" className="bg-surface-2/40">
      <div className="container-orbit">
        <SectionIntro center eyebrow={t('Capabilities', 'Kapabilitas')} title={t('Everything a future-ready learner needs, connected.', 'Semua yang dibutuhkan pelajar siap masa depan, terhubung.')} />
        <motion.div variants={stagger(0.05)} {...reveal} className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tiles.map((x) => (
            <motion.div
              key={x.title}
              variants={fadeUp}
              className={cn(
                'card card-interactive flex flex-col p-6',
                x.className,
                x.accent === 'dark' && 'border-[#1e3a2c] bg-[#0f1d16] text-white [&_p]:text-white/65',
              )}
            >
              <span className={cn('flex size-11 items-center justify-center rounded-2xl', x.accent === 'orange' ? 'bg-orange text-white shadow-orange' : x.accent === 'dark' ? 'bg-green text-white' : 'bg-muted-green text-green-strong dark:text-green')}>
                <x.icon className="size-5" />
              </span>
              <h3 className={cn('mt-5 font-display text-[18px] font-bold leading-snug', x.accent === 'dark' && 'text-white')}>{x.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{x.body}</p>
              {x.visual}
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-10 flex justify-center">
          <Button size="lg" asChild>
            <Link to="/start?demo=1">
              {t('Experience it as Naya', 'Rasakan sebagai Naya')} <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

