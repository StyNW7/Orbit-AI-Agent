import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { CircleAlert, Frown, HeartHandshake, MapPin, Quote, Target } from 'lucide-react';
import { Avatar } from '@/components/ui/primitives';
import { NAYA } from '@/data/persona';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { STAGES, UNEMPLOYED_TOTAL, fmt } from './data';
import { Chapter, Heading, Lead } from './parts';

// ─────────────────────────────────────────────────────────── 04 · Persona

function PersonaCard() {
  const { t, locale } = useT();
  const blocks = [
    {
      icon: Target,
      title: t('Hopes', 'Harapan'),
      tone: 'bg-muted-green text-green-strong dark:text-green',
      items: [t('A meaningful career in digital products', 'Karier bermakna di dunia produk digital'), t('A job soon after graduating', 'Langsung bekerja setelah lulus'), t('Make her parents proud', 'Membanggakan orang tuanya')],
    },
    {
      icon: Frown,
      title: t('Frustrations', 'Frustrasi'),
      tone: 'bg-muted-orange text-orange-strong dark:text-orange',
      items: [t('Doesn’t know which classes matter', 'Tak tahu mata kuliah mana yang penting'), t('Opportunities scattered everywhere', 'Info peluang tercecer di mana-mana'), t('No one to guide her personally', 'Tak ada yang membimbing secara personal')],
    },
    {
      icon: HeartHandshake,
      title: t('What she needs', 'Yang ia butuhkan'),
      tone: 'bg-muted-info text-info',
      items: [t('A clear direction', 'Arah yang jelas'), t('A realistic weekly plan', 'Rencana mingguan yang realistis'), t('Progress she can see', 'Progres yang bisa ia lihat')],
    },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.7, ease }} className="card mt-12 grid overflow-hidden lg:grid-cols-[1fr_1.55fr]">
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-mint via-surface to-cream p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <div className="pointer-events-none absolute -left-12 -top-12 size-44 rounded-full bg-green/15 blur-3xl" aria-hidden />
        <div className="relative flex items-center gap-4">
          <Avatar name={NAYA.name} hue={NAYA.avatarHue} size={76} />
          <div className="min-w-0">
            <div className="eyebrow text-[11px]">{t('User persona', 'User persona')}</div>
            <div className="font-display text-[24px] font-extrabold tracking-[-0.03em]">{NAYA.name}</div>
            <div className="flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" /> {NAYA.university}
            </div>
          </div>
        </div>
        <div className="relative mt-5 flex flex-wrap gap-1.5">
          {[t('21 years old', '21 tahun'), t('Information Systems', 'Sistem Informasi'), t('Semester 7', 'Semester 7'), t('GPA {g}', 'IPK {g}', { g: fmt(NAYA.gpa, locale, 2) })].map((x) => (
            <span key={x} className="rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold">
              {x}
            </span>
          ))}
        </div>
        <blockquote className="relative mt-6 font-display text-[21px] font-bold leading-snug tracking-[-0.02em] sm:text-[23px]">
          <Quote className="mb-2 size-6 text-green" aria-hidden />
          {t('“I study hard. I just don’t know what any of it is for.”', '“Aku rajin kuliah. Tapi aku nggak tahu semua ini untuk apa.”')}
        </blockquote>
      </div>
      <motion.div variants={stagger(0.1, 0.2)} {...reveal} className="grid gap-px bg-border sm:grid-cols-3">
        {blocks.map((b) => (
          <motion.div key={b.title} variants={fadeUp} className="bg-surface p-6">
            <span className={cn('flex size-10 items-center justify-center rounded-xl', b.tone)}>
              <b.icon className="size-[18px]" />
            </span>
            <h3 className="mt-4 font-display text-[16px] font-bold">{b.title}</h3>
            <ul className="mt-3 space-y-2.5">
              {b.items.map((it) => (
                <li key={it} className="flex gap-2 text-[14px] leading-snug text-muted-foreground">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-border-strong" aria-hidden />
                  {it}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
function smooth(pts: [number, number][]) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const W = 1000;
const H = 200;
const POINTS: [number, number][] = STAGES.map((s, i) => [100 + i * 200, 24 + ((100 - s.mood) / 100) * (H - 48)]);
const MOOD_COLORS = ['#0AB46A', '#7CC05A', '#FB9002', '#E2632A', '#C5192D'];

function MoodCurve() {
  const { t, l } = useT();
  const line = smooth(POINTS);
  const area = `${line} L ${POINTS[POINTS.length - 1][0]} ${H} L ${POINTS[0][0]} ${H} Z`;
  return (
    <div className="relative">
      <div className="absolute -left-2 top-0 hidden -translate-x-full flex-col justify-between py-4 text-[11px] font-semibold text-subtle-foreground xl:flex" style={{ height: H }} aria-hidden>
        <span>{t('High', 'Tinggi')}</span>
        <span>{t('Low', 'Rendah')}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[200px] w-full overflow-visible" role="img" aria-label={t('Naya’s motivation falls from semester 1 to semester 7', 'Motivasi Naya turun dari semester 1 ke semester 7')}>
        <defs>
          <linearGradient id="mood-line" x1="0" x2="1" y1="0" y2="0">
            {MOOD_COLORS.map((c, i) => (
              <stop key={c} offset={i / (MOOD_COLORS.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
          <linearGradient id="mood-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FB9002" stopOpacity="0.16" />
            <stop offset="1" stopColor="#FB9002" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--border)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={area} fill="url(#mood-area)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.8 }} />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#mood-line)"
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </svg>
      {POINTS.map(([x, y], i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease, delay: 0.35 * i + 0.2 }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
        >
          <span className="block size-4 rounded-full border-[3px] border-surface shadow-card" style={{ background: MOOD_COLORS[i] }} />
          <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-bold text-white shadow-xs" style={{ background: MOOD_COLORS[i] }}>
            {l(STAGES[i].feel)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function Journey() {
  const { t, l } = useT();
  return (
    <div className="mt-20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-muted-danger px-3 py-1 text-[12px] font-bold uppercase tracking-[0.1em] text-danger">{t('Before Orbit', 'Sebelum Orbit')}</div>
          <h3 className="mt-3 font-display text-[26px] font-extrabold tracking-[-0.03em] sm:text-[32px]">{t('Naya’s journey: busy, but going nowhere.', 'Perjalanan Naya: sibuk, tapi tak ke mana-mana.')}</h3>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="h-1 w-8 rounded-full" style={{ background: `linear-gradient(90deg, ${MOOD_COLORS.join(',')})` }} aria-hidden />
          {t('Naya’s motivation', 'Motivasi Naya')}
        </div>
      </div>

      {/* Desktop: curve + aligned stage cards */}
      <div className="mt-12 hidden lg:block">
        <MoodCurve />
        <motion.ol variants={stagger(0.12, 0.3)} {...reveal} className="mt-6 grid grid-cols-5 gap-3">
          {STAGES.map((s, i) => (
            <motion.li key={i} variants={fadeUp} className="card flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{l(s.when)}</span>
                <s.icon className="size-4 text-subtle-foreground" />
              </div>
              <h4 className="mt-3 font-display text-[16.5px] font-bold leading-snug">{l(s.title)}</h4>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{l(s.body)}</p>
              <div className="mt-auto pt-4">
                <div className="flex items-start gap-1.5 rounded-xl bg-muted-danger px-2.5 py-2 text-[12px] font-semibold leading-snug text-danger">
                  <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                  <span>
                    {t('Missing:', 'Yang hilang:')} {l(s.missing)}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>

      {/* Mobile & tablet: vertical timeline */}
      <motion.ol variants={stagger(0.1)} {...reveal} className="relative mt-10 space-y-4 lg:hidden">
        <span className="absolute bottom-6 left-[19px] top-6 w-0.5 rounded-full" style={{ background: `linear-gradient(180deg, ${MOOD_COLORS.join(',')})` }} aria-hidden />
        {STAGES.map((s, i) => (
          <motion.li key={i} variants={fadeUp} className="relative flex gap-4">
            <span className="relative z-10 mt-4 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-background text-white" style={{ background: MOOD_COLORS[i] }}>
              <s.icon className="size-4" />
            </span>
            <div className="card min-w-0 flex-1 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{l(s.when)}</span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: MOOD_COLORS[i] }}>
                  {l(s.feel)}
                </span>
              </div>
              <h4 className="mt-2 font-display text-[17px] font-bold">{l(s.title)}</h4>
              <p className="mt-1.5 text-[14px] text-muted-foreground">{l(s.body)}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-muted-danger px-2.5 py-1 text-[12px] font-semibold text-danger">
                <CircleAlert className="size-3.5" aria-hidden /> {t('Missing:', 'Yang hilang:')} {l(s.missing)}
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}

export function NayaSection() {
  const { t } = useT();
  return (
    <section id="naya" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-40 top-24 size-[460px] rounded-full bg-green/8 blur-3xl" aria-hidden />
      <div className="container-orbit relative">
        <Chapter n="04" label={t('The persona', 'Persona')} tone="orange" />
        <Heading className="max-w-4xl">{t('Meet Naya. Her story is the story of millions of Indonesian learners.', 'Kenalan dengan Naya. Ceritanya adalah cerita jutaan pelajar Indonesia.')}</Heading>
        <Lead>{t('Smart, hardworking, always present in class. Yet after seven semesters, she still can’t answer one question: “What is all this for?”', 'Pintar, rajin, selalu hadir di kelas. Tapi setelah tujuh semester, ia masih belum bisa menjawab satu pertanyaan: “Semua ini untuk apa?”')}</Lead>
        <PersonaCard />
        <Journey />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────── The fear

const COLS = 24;
const ROWS = 15;
const DOTS = COLS * ROWS; // each ≈ 20,500 people
const NAYA_DOT = 9 * COLS + 16;

function DotField() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  return (
    <div ref={ref} className="relative grid gap-[5px] sm:gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-hidden>
      {Array.from({ length: DOTS }, (_, i) => {
        const naya = i === NAYA_DOT;
        const delay = ((i * 37) % DOTS) / DOTS;
        return (
          <span
            key={i}
            className={cn('relative aspect-square rounded-full transition-[opacity,transform] duration-500', naya ? 'z-10 bg-orange' : 'bg-white/20')}
            style={{ opacity: inView ? 1 : 0, transform: inView ? 'scale(1)' : 'scale(0.3)', transitionDelay: `${naya ? 1.3 : delay}s` }}
          >
            {naya && (
              <>
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-orange" />
                <span className="absolute -inset-1 rounded-full ring-2 ring-orange/70" />
                <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange px-2 py-0.5 text-[11px] font-bold text-white shadow-orange">Naya?</span>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function FearSection() {
  const { t, locale } = useT();
  const each = Math.round((UNEMPLOYED_TOTAL * 1_000_000) / DOTS / 500) * 500;
  return (
    <section id="fear" className="relative scroll-mt-20 overflow-hidden bg-[#0c1310] py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-1/3 size-[520px] rounded-full blur-3xl" style={{ background: 'rgba(197,25,45,0.22)' }} aria-hidden />
      <div className="container-orbit relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-white/70">
              <span className="size-1.5 animate-pulse rounded-full bg-orange" aria-hidden /> {t('Semester 7 · 2 a.m.', 'Semester 7 · pukul 02.00')}
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: 0.1 }} className="mt-6 font-display text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-[48px]">
              {t('“What if I become one of those', '“Bagaimana kalau aku jadi satu dari')}{' '}
              <span className="text-orange">{t('{n} million', '{n} juta', { n: fmt(UNEMPLOYED_TOTAL, locale, 2) })}</span>
              {t('?”', ' itu?”')}
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: 0.25 }} className="mt-5 max-w-md text-[16px] leading-relaxed text-white/65">
              {t('Each dot is about {n} people without work. One of them could be Naya — or any learner studying without direction today.', 'Setiap titik mewakili sekitar {n} orang yang menganggur. Salah satunya bisa jadi Naya — atau siapa pun yang hari ini belajar tanpa arah.', { n: fmt(each, locale) })}
            </motion.p>
          </div>
          <DotField />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.8, ease }} className="mx-auto mt-24 max-w-3xl text-center">
          <p className="font-display text-[24px] font-bold leading-snug tracking-[-0.02em] text-white/60 sm:text-[30px]">{t('Naya doesn’t need to study more.', 'Naya tidak butuh belajar lebih banyak.')}</p>
          <p className="mt-1 font-display text-[32px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[44px]">
            {t('She needs to study', 'Ia butuh belajar')} <span className="orbit-gradient-text">{t('with direction.', 'dengan arah.')}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
