import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import {
  BarChart3,

  BriefcaseBusiness,
  Compass,
  FileText,
  Gauge,
  GraduationCap,
  HelpCircle,
  Layers,
  LineChart,
  Orbit as OrbitIcon,
  Route,
  Sparkles,
  StickyNote,
  Target,
  User,
  Users,
  Zap,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { OrbitMark, ReadinessRing } from '@/components/brand/brand';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { useMediaQuery } from '@/hooks/use-media';
import { Section, SectionIntro } from './chrome';

// ─────────────────────────────────────────────────────────── Problem

const SCATTER: { icon: LucideIcon; title: { en: string; id: string }; meta: { en: string; id: string }; x: number; y: number; r: number; tone: string }[] = [
  { icon: FileText, title: { en: 'CV_final_v7.pdf', id: 'CV_final_v7.pdf' }, meta: { en: 'Last edited 3 weeks ago', id: 'Terakhir diubah 3 minggu lalu' }, x: -430, y: -40, r: -8, tone: 'bg-muted-info text-info' },
  { icon: BriefcaseBusiness, title: { en: 'Job portals', id: 'Portal lowongan' }, meta: { en: '214 listings, no idea which fit', id: '214 lowongan, tak tahu mana yang cocok' }, x: 410, y: -50, r: 7, tone: 'bg-muted-orange text-orange-strong dark:text-orange' },
  { icon: GraduationCap, title: { en: 'Course bookmarks', id: 'Bookmark kursus' }, meta: { en: '12 saved · 1 finished', id: '12 disimpan · 1 selesai' }, x: -470, y: 130, r: 6, tone: 'bg-muted-green text-green-strong dark:text-green' },
  { icon: Users, title: { en: 'Mentors', id: 'Mentor' }, meta: { en: '“Who should I even ask?”', id: '“Harus tanya siapa?”' }, x: 450, y: 120, r: -6, tone: 'bg-muted-violet text-violet' },
  { icon: StickyNote, title: { en: 'Notes app', id: 'Aplikasi catatan' }, meta: { en: '38 scattered notes', id: '38 catatan tercecer' }, x: -170, y: 170, r: -4, tone: 'bg-surface-2 text-muted-foreground' },
  { icon: BarChart3, title: { en: 'Progress spreadsheet', id: 'Spreadsheet progres' }, meta: { en: 'Abandoned in week 2', id: 'Ditinggal di minggu ke-2' }, x: 190, y: 175, r: 5, tone: 'bg-muted-orange text-orange-strong dark:text-orange' },
];

function ScatterCard({ c, progress, index }: { c: (typeof SCATTER)[number]; progress: MotionValue<number>; index: number }) {
  const { l } = useT();
  const start = 0.12 + index * 0.02;
  const x = useTransform(progress, [start, 0.62], [c.x, 0]);
  const y = useTransform(progress, [start, 0.62], [c.y, 0]);
  const rotate = useTransform(progress, [start, 0.62], [c.r, 0]);
  const scale = useTransform(progress, [0.45, 0.66], [1, 0.25]);
  const opacity = useTransform(progress, [0.55, 0.68], [1, 0]);
  return (
    <motion.div style={{ x, y, rotate, scale, opacity }} className="absolute left-1/2 top-[62%] -ml-[120px] -mt-[38px] w-[240px]">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-hover">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', c.tone)}>
          <c.icon className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold">{l(c.title)}</div>
          <div className="truncate text-[12px] text-muted-foreground">{l(c.meta)}</div>
        </div>
      </div>
    </motion.div>
  );
}

function PainPoints() {
  const { t } = useT();
  const pains = [
    { icon: HelpCircle, title: t('No clear starting point', 'Tidak tahu harus mulai dari mana'), body: t('Students know the goal, but not the first concrete step toward it.', 'Mahasiswa tahu tujuannya, tetapi tidak tahu langkah konkret pertamanya.') },
    { icon: Layers, title: t('Skill gaps are difficult to prioritize', 'Gap skill sulit diprioritaskan'), body: t('Everything looks important, so nothing gets finished.', 'Semuanya terlihat penting, sehingga tidak ada yang selesai.') },
    { icon: LineChart, title: t('Progress is difficult to measure', 'Progres sulit diukur'), body: t('Without a score, effort never translates into confidence.', 'Tanpa skor, usaha tidak pernah berubah menjadi kepercayaan diri.') },
  ];
  return (
    <motion.div variants={stagger(0.1)} {...reveal} className="grid gap-4 md:grid-cols-3">
      {pains.map((p, i) => (
        <motion.div key={p.title} variants={fadeUp} className="card p-6">
          <div className="flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-muted-orange text-orange-strong dark:text-orange">
              <p.icon className="size-5" />
            </span>
            <span className="tabular font-display text-[13px] font-bold text-subtle-foreground">0{i + 1}</span>
          </div>
          <h3 className="mt-5 font-display text-[18px] font-bold leading-snug">{p.title}</h3>
          <p className="mt-2 text-[14.5px] text-muted-foreground">{p.body}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ProblemSection() {
  const { t, l } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery('(min-width: 1024px)');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const titleOpacity = useTransform(scrollYProgress, [0.5, 0.62], [1, 0.12]);
  const titleY = useTransform(scrollYProgress, [0.5, 0.62], [0, -16]);
  const orbitScale = useTransform(scrollYProgress, [0.58, 0.78], [0.3, 1]);
  const orbitOpacity = useTransform(scrollYProgress, [0.58, 0.7], [0, 1]);
  const answerOpacity = useTransform(scrollYProgress, [0.68, 0.8], [0, 1]);
  const answerY = useTransform(scrollYProgress, [0.68, 0.8], [30, 0]);

  return (
    <section id="problem" className="relative scroll-mt-20">
      {desktop ? (
        <div ref={ref} className="relative h-[230vh]">
          <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-cream/60 to-background" aria-hidden />
            <div className="container-orbit relative h-full">
              <div className="relative h-full">
                {SCATTER.map((c, i) => (
                  <ScatterCard key={i} c={c} index={i} progress={scrollYProgress} />
                ))}
                <motion.div style={{ opacity: titleOpacity, y: titleY }} className="absolute inset-x-0 top-[11%] flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange/25 bg-muted-orange/70 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.1em] text-orange-strong dark:text-orange">
                    <span className="size-1.5 rounded-full bg-orange" /> {t('The problem', 'Masalahnya')}
                  </div>
                  <h2 className="mt-4 max-w-3xl font-display text-[44px] font-extrabold leading-[1.05] tracking-[-0.035em]">{t('Career preparation is fragmented across too many platforms.', 'Persiapan karier tersebar di terlalu banyak platform.')}</h2>
                  <p className="mt-4 max-w-2xl text-[17px] text-muted-foreground">
                    {t('Students spend significant time moving between disconnected tools without understanding which action actually improves career readiness.', 'Mahasiswa menghabiskan banyak waktu berpindah antar tools yang tidak terhubung tanpa memahami aksi mana yang benar-benar meningkatkan kesiapan karier.')}
                  </p>
                </motion.div>
                <motion.div style={{ scale: orbitScale, opacity: orbitOpacity }} className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <span className="absolute -inset-10 rounded-full bg-green/25 blur-2xl" aria-hidden />
                    <OrbitMark className="relative size-24 drop-shadow-[0_24px_40px_rgba(10,180,106,0.45)]" animated />
                  </div>
                </motion.div>
                <motion.div style={{ opacity: answerOpacity, y: answerY }} className="absolute inset-x-0 top-[77%] text-center">
                  <h2 className="font-display text-[38px] font-extrabold leading-tight tracking-[-0.035em]">
                    {t('Orbit brings it all', 'Orbit menyatukan semuanya')} <span className="orbit-gradient-text">{t('into one place.', 'dalam satu tempat.')}</span>
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg text-[17px] text-muted-foreground">{t('One profile. One context. One connected journey.', 'Satu profil. Satu konteks. Satu journey yang terhubung.')}</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20">
          <div className="container-orbit">
            <SectionIntro eyebrow={t('The problem', 'Masalahnya')} title={t('Career preparation is fragmented across too many platforms.', 'Persiapan karier tersebar di terlalu banyak platform.')} desc={t('Students spend significant time moving between disconnected tools without understanding which action actually improves career readiness.', 'Mahasiswa menghabiskan banyak waktu berpindah antar tools yang tidak terhubung tanpa memahami aksi mana yang benar-benar meningkatkan kesiapan karier.')} />
            <motion.div variants={stagger(0.06)} {...reveal} className="mt-8 grid grid-cols-2 gap-3">
              {SCATTER.map((c, i) => (
                <motion.div key={i} variants={fadeUp} style={{ rotate: c.r / 3 }} className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-card">
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', c.tone)}>
                    <c.icon className="size-4" />
                  </span>
                  <span className="min-w-0 truncate text-[13px] font-semibold">{l(c.title)}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
      <div className="container-orbit pb-8">
        <PainPoints />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────── Connected

const ECO: { icon: LucideIcon; en: string; id: string }[] = [
  { icon: User, en: 'Career Profile', id: 'Career Profile' },
  { icon: Target, en: 'Career Gaps', id: 'Gap Karier' },
  { icon: BriefcaseBusiness, en: 'Opportunities', id: 'Peluang' },
  { icon: GraduationCap, en: 'Learning', id: 'Pembelajaran' },
  { icon: Users, en: 'Mentors', id: 'Mentor' },
  { icon: Route, en: 'Journey', id: 'Journey' },
  { icon: LineChart, en: 'Progress', id: 'Progress' },
];

export function ConnectedSection() {
  const { t, l } = useT();
  return (
    <Section id="connected">
      <div className="container-orbit grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionIntro
            eyebrow={t('The solution', 'Solusinya')}
            title={
              <>
                {t('One profile. One context.', 'Satu profil. Satu konteks.')} <span className="orbit-gradient-text">{t('One connected journey.', 'Satu journey yang terhubung.')}</span>
              </>
            }
            desc={t('Orbit connects your profile, gaps, opportunities, learning, mentors, journey and progress — so every recommendation understands everything else.', 'Orbit menghubungkan profil, gap, peluang, pembelajaran, mentor, journey, dan progresmu — sehingga setiap rekomendasi memahami semua hal lainnya.')}
          />
          <motion.ul variants={stagger(0.08)} {...reveal} className="mt-8 space-y-3">
            {[
              { icon: Gauge, title: t('Understand where you stand', 'Pahami posisimu'), body: t('An explainable Career Readiness score across six dimensions.', 'Skor Career Readiness yang dijelaskan di enam dimensi.') },
              { icon: Compass, title: t('See what matters most', 'Lihat yang paling penting'), body: t('Gaps ranked by importance and real demand from openings.', 'Gap diurutkan berdasarkan kepentingan dan permintaan lowongan nyata.') },
              { icon: Zap, title: t('Always know the next step', 'Selalu tahu langkah berikutnya'), body: t('One Next Best Action, with its expected impact.', 'Satu Next Best Action, lengkap dengan perkiraan dampaknya.') },
            ].map((x) => (
              <motion.li key={x.title} variants={fadeUp} className="flex gap-4 rounded-2xl p-3 transition hover:bg-surface">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted-green text-green-strong dark:text-green">
                  <x.icon className="size-5" />
                </span>
                <div>
                  <div className="font-display text-[16.5px] font-bold">{x.title}</div>
                  <div className="text-[14.5px] text-muted-foreground">{x.body}</div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-15% 0px' }} className="relative mx-auto aspect-square w-full max-w-[520px]">
          <div className="absolute inset-[22%] rounded-full bg-green/15 blur-3xl" aria-hidden />
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
            <motion.circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-strong)" strokeWidth="0.3" strokeDasharray="1 1.5" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.4, ease } } }} />
            <circle cx="50" cy="50" r="24" fill="none" stroke="var(--border)" strokeWidth="0.3" />
            {ECO.map((_, i) => {
              const a = (i / ECO.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + Math.cos(a) * 38}
                  y2={50 + Math.sin(a) * 38}
                  stroke={i % 3 === 1 ? '#FB9002' : '#0AB46A'}
                  strokeOpacity="0.5"
                  strokeWidth="0.35"
                  variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.8, delay: 0.5 + i * 0.1, ease } } }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0" style={{ animation: 'orbit-spin 90s linear infinite' }}>
            {ECO.map((n, i) => {
              const a = (i / ECO.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <motion.div
                  key={n.en}
                  variants={{ hidden: { opacity: 0, scale: 0.5 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.7 + i * 0.1, ease } } }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%` }}
                >
                  <div className="flex flex-col items-center gap-1.5" style={{ animation: 'counter-spin 90s linear infinite' }}>
                    <span className={cn('flex size-12 items-center justify-center rounded-2xl shadow-card ring-4 ring-background sm:size-14', i % 3 === 1 ? 'bg-orange text-white' : 'bg-surface text-green-strong dark:text-green')}>
                      <n.icon className="size-5 sm:size-6" />
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-surface/90 px-2 py-0.5 text-[12px] font-semibold shadow-xs sm:text-[13px]">{l(n)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.div variants={{ hidden: { scale: 0.5, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { duration: 0.7, ease, delay: 0.2 } } }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <OrbitMark className="size-20 drop-shadow-[0_18px_30px_rgba(10,180,106,0.45)] sm:size-24" animated />
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────── How it works

const STAGES: { icon: LucideIcon; title: { en: string; id: string }; body: { en: string; id: string } }[] = [
  { icon: User, title: { en: 'Career Profile', id: 'Career Profile' }, body: { en: 'Your studies, experiences, projects and skills become measurable evidence.', id: 'Studi, pengalaman, proyek, dan skill-mu menjadi bukti yang terukur.' } },
  { icon: Gauge, title: { en: 'Career Intelligence', id: 'Career Intelligence' }, body: { en: 'Orbit scores readiness across six dimensions and explains every number.', id: 'Orbit menilai kesiapan di enam dimensi dan menjelaskan setiap angkanya.' } },
  { icon: OrbitIcon, title: { en: 'Career Universe', id: 'Career Universe' }, body: { en: 'See how skills, people, learning and opportunities connect to you.', id: 'Lihat bagaimana skill, orang, pembelajaran, dan peluang terhubung denganmu.' } },
  { icon: BriefcaseBusiness, title: { en: 'Opportunity Intelligence', id: 'Opportunity Intelligence' }, body: { en: 'Jobs, internships, courses and mentors ranked by fit — with reasons.', id: 'Pekerjaan, magang, kursus, dan mentor diurutkan berdasarkan kecocokan — dengan alasannya.' } },
  { icon: Route, title: { en: 'Adaptive Career Journey', id: 'Adaptive Career Journey' }, body: { en: 'A roadmap and board of quests that adapts as you grow.', id: 'Roadmap dan board berisi quest yang menyesuaikan saat kamu bertumbuh.' } },
  { icon: Zap, title: { en: 'Next Best Action', id: 'Next Best Action' }, body: { en: 'Always one clear step with its expected readiness impact.', id: 'Selalu satu langkah jelas dengan perkiraan dampak kesiapannya.' } },
];

function StagePreview({ i }: { i: number }) {
  const { t } = useT();
  const box = 'rounded-[22px] border border-border bg-surface p-5 shadow-card sm:p-6';
  switch (i) {
    case 0:
      return (
        <div className={box}>
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-green to-[#3fc06a] font-display font-bold text-white">NP</span>
            <div>
              <div className="font-display text-[16px] font-bold">Naya Prameswari</div>
              <div className="text-[13px] text-muted-foreground">Information Systems · {t('Semester 7', 'Semester 7')} · GPA 3.62</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              ['3', t('Experiences', 'Pengalaman')],
              ['4', t('Projects', 'Proyek')],
              ['15', t('Skills', 'Skill')],
            ].map(([v, k]) => (
              <div key={k} className="rounded-xl bg-surface-2 p-3">
                <div className="font-display text-[22px] font-bold">{v}</div>
                <div className="text-[12px] text-muted-foreground">{k}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case 1:
      return (
        <div className={cn(box, 'flex items-center gap-6')}>
          <ReadinessRing score={74} size={124} stroke={10} />
          <div className="flex-1 space-y-2.5">
            {[
              [t('Projects', 'Proyek'), 82],
              [t('Skills', 'Skill'), 78],
              [t('Interview', 'Wawancara'), 60],
            ].map(([k, v]) => (
              <div key={k as string}>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-bold">{v}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <motion.div className={cn('h-full rounded-full', (v as number) < 65 ? 'bg-orange' : 'bg-green')} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, ease }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 2:
      return (
        <div className={cn(box, 'relative h-[200px] overflow-hidden')}>
          <svg viewBox="0 0 300 160" className="absolute inset-0 size-full" aria-hidden>
            {[
              [60, 40],
              [240, 36],
              [40, 120],
              [260, 124],
              [150, 18],
              [150, 145],
            ].map(([x, y], k) => (
              <motion.line key={k} x1="150" y1="80" x2={x} y2={y} stroke={k === 1 ? '#FB9002' : '#0AB46A'} strokeOpacity=".5" strokeWidth="1.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: k * 0.08 }} />
            ))}
            <circle cx="150" cy="80" r="18" fill="#0AB46A" />
            {[
              [60, 40, '#0AB46A'],
              [240, 36, '#FB9002'],
              [40, 120, '#3B82C4'],
              [260, 124, '#7C6CD8'],
              [150, 18, '#13201A'],
              [150, 145, '#0AB46A'],
            ].map(([x, y, c], k) => (
              <motion.circle key={k} cx={x} cy={y} r="9" fill={c as string} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + k * 0.06 }} />
            ))}
          </svg>
          <span className="absolute left-1/2 top-[43%] -translate-x-1/2 text-[11px] font-bold text-white">YOU</span>
        </div>
      );
    case 3:
      return (
        <div className={box}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wider text-orange-strong dark:text-orange">{t('Internship', 'Magang')}</div>
              <div className="mt-1 font-display text-[16px] font-bold">Product Management Internship</div>
              <div className="text-[13px] text-muted-foreground">Lumen Commerce · Jakarta</div>
            </div>
            <span className="tabular rounded-full bg-muted-green px-2.5 py-1 text-[13px] font-bold text-green-strong dark:text-green">92%</span>
          </div>
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {[t('Matches your Product Manager target', 'Sesuai target Product Manager-mu'), t('Uses 5 of your existing skills', 'Memakai 5 skill yang kamu miliki'), t('Helps close your Product Strategy gap', 'Membantu menutup gap Product Strategy')].map((r) => (
              <li key={r} className="flex items-center gap-2">
                <Check className="size-4 text-green" /> {r}
              </li>
            ))}
          </ul>
        </div>
      );
    case 4:
      return (
        <div className={cn(box, 'grid grid-cols-3 gap-2')}>
          {[t('To do', 'To do'), t('In progress', 'Berjalan'), t('Done', 'Selesai')].map((c, k) => (
            <div key={c} className="rounded-xl bg-surface-2 p-2">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{c}</div>
              {[0, 1].map((r) => (
                <motion.div key={r} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.1 + r * 0.08 }} className="mb-1.5 rounded-lg bg-surface p-2 shadow-xs">
                  <div className={cn('h-1.5 w-10 rounded-full', k === 0 ? 'bg-surface-3' : k === 1 ? 'bg-orange/60' : 'bg-green/60')} />
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-3" />
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="relative overflow-hidden rounded-[22px] bg-[#0f1d16] p-6 text-white shadow-pop">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-green/35 blur-3xl" aria-hidden />
          <div className="relative flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-orange">
            <Sparkles className="size-3.5" /> Next Best Action
          </div>
          <div className="relative mt-2 font-display text-[19px] font-bold">{t('Complete Product Analytics Foundations', 'Selesaikan Product Analytics Foundations')}</div>
          <div className="relative mt-2 text-[13px] text-white/65">{t('Required by 8 opportunities matching your target.', 'Dibutuhkan oleh 8 peluang yang cocok dengan targetmu.')}</div>
          <div className="relative mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold text-[#4ee39a]">+4.2% {t('readiness', 'kesiapan')}</div>
        </div>
      );
  }
}

export function HowItWorksSection() {
  const { t, l } = useT();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STAGES.length), 3800);
    return () => clearInterval(id);
  }, [auto]);
  const pick = (i: number) => {
    setActive(i);
    setAuto(false);
  };
  return (
    <Section id="how" className="bg-surface-2/40">
      <div className="container-orbit">
        <SectionIntro center eyebrow={t('How Orbit works', 'Cara kerja Orbit')} title={t('From profile to next action in six connected steps.', 'Dari profil ke aksi berikutnya dalam enam langkah terhubung.')} desc={t('Understand → Explore → Plan → Act → Grow. Select a step to preview it.', 'Pahami → Eksplorasi → Rencanakan → Bertindak → Tumbuh. Pilih langkah untuk melihat pratinjaunya.')} />
        <div className="relative mt-14">
          <div className="absolute left-[8%] right-[8%] top-7 hidden h-[3px] rounded-full bg-surface-3 lg:block" aria-hidden>
            <motion.div className="h-full rounded-full bg-gradient-to-r from-green to-orange" animate={{ width: `${(active / (STAGES.length - 1)) * 100}%` }} transition={{ duration: 0.6, ease }} />
          </div>
          <ol role="tablist" aria-label={t('Steps', 'Langkah')} className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {STAGES.map((s, i) => {
              const on = i === active;
              const past = i < active;
              return (
                <li key={s.title.en}>
                  <button type="button" role="tab" aria-selected={on} onClick={() => pick(i)} onMouseEnter={() => pick(i)} className="group flex w-full flex-col items-center text-center focus-visible:outline-none">
                    <span className={cn('relative flex size-14 items-center justify-center rounded-2xl border-2 bg-surface transition-all duration-300 group-focus-visible:ring-4 group-focus-visible:ring-[var(--ring)]', on ? 'scale-110 border-green bg-green text-white shadow-green' : past ? 'border-green/50 text-green' : 'border-border text-muted-foreground group-hover:border-border-strong')}>
                      <s.icon className="size-6" />
                      <span className={cn('tabular absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full text-[11px] font-bold ring-4 ring-background', on || past ? 'bg-orange text-white' : 'bg-surface-3 text-muted-foreground')}>{i + 1}</span>
                    </span>
                    <span className={cn('mt-3 font-display text-[14.5px] font-bold leading-tight transition-colors', on ? 'text-foreground' : 'text-muted-foreground')}>{l(s.title)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl items-center gap-8 md:grid-cols-2">
          <AnimatePresence mode="wait">
            <motion.div key={`t${active}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.35, ease }}>
              <div className="text-[13px] font-bold uppercase tracking-wider text-green-strong dark:text-green">
                {t('Step', 'Langkah')} {active + 1} / {STAGES.length}
              </div>
              <h3 className="mt-2 font-display text-[28px] font-extrabold tracking-tight">{l(STAGES[active].title)}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">{l(STAGES[active].body)}</p>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={`p${active}`} initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.35, ease }}>
              <StagePreview i={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

