import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  Building2,
  CalendarCheck,
  Check,
  Clock,
  Compass,
  ExternalLink,
  Flag,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  PlayCircle,
  Scale,
  School,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ReadinessRing } from '@/components/brand/brand';
import { Button } from '@/components/ui/button';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { SDG4_RED } from '@/features/landing/MissionSection';
import { SOURCES } from './data';
import { Chapter, Heading, Lead } from './parts';

// ─────────────────────────────────────────────────────────── 07 · Impact & KPIs

export function ImpactSection() {
  const { t } = useT();
  const chain: { tag: string; icon: LucideIcon; title: string; body: string }[] = [
    { tag: t('Activity', 'Aktivitas'), icon: Compass, title: t('Learners study with direction', 'Pelajar belajar terarah'), body: t('Every lesson is tied to a career goal.', 'Setiap pelajaran terhubung ke tujuan karier.') },
    { tag: 'Output', icon: Target, title: t('Relevant skills, early', 'Skill relevan sejak dini'), body: t('Gaps surface in semester one, not the last.', 'Gap terlihat sejak semester satu, bukan di akhir.') },
    { tag: 'Outcome', icon: BadgeCheck, title: t('Graduates who are ready', 'Lulusan yang siap kerja'), body: t('Portfolio, experience and measured readiness.', 'Portofolio, pengalaman, dan kesiapan yang terukur.') },
    { tag: t('Impact', 'Dampak'), icon: TrendingDown, title: t('Fewer educated unemployed', 'Pengangguran terdidik berkurang'), body: t('A productive demographic dividend for Indonesia.', 'Bonus demografi Indonesia yang produktif.') },
  ];
  const kpis: { icon: LucideIcon; value: string; label: string; when: string }[] = [
    { icon: Users, value: '250K', label: t('active learners', 'pelajar aktif'), when: t('Year 3 · from 10K in year 1', 'Tahun 3 · dari 10 rb di tahun 1') },
    { icon: Building2, value: '100', label: t('partner schools & campuses', 'sekolah & kampus mitra'), when: t('Year 3 · from 10 pilots', 'Tahun 3 · dari 10 pilot') },
    { icon: TrendingUp, value: '+15', label: t('points of Career Readiness', 'poin Career Readiness'), when: t('Per active semester', 'Per semester aktif') },
    { icon: GraduationCap, value: '100%', label: t('of classes mapped to a career reason', 'mata kuliah terpetakan ke alasan karier'), when: t('From day one', 'Sejak hari pertama') },
    { icon: Clock, value: t('30 min', '30 mnt'), label: t('weekly planning, down from 3–5 h', 'rencana belajar mingguan, dari 3–5 jam'), when: t('Per learner', 'Per pelajar') },
    { icon: CalendarCheck, value: '70%', label: t('finish ≥1 quest every week', 'menyelesaikan ≥1 quest tiap minggu'), when: t('Year 1', 'Tahun 1') },
    { icon: Lightbulb, value: '80%', label: t('know why they learn each class', 'tahu kenapa mempelajari tiap mata kuliah'), when: t('Learner survey · year 1', 'Survei pelajar · tahun 1') },
    { icon: Briefcase, value: t('≤6 mo', '≤6 bln'), label: t('to a first job or internship after graduating', 'menuju kerja/magang pertama setelah lulus'), when: t('Orbit alumni target', 'Target alumni Orbit') },
  ];
  const phases = [
    { n: t('Phase 1', 'Fase 1'), name: 'Pilot', year: '2027', partners: '10', learners: t('10K', '10 rb'), note: t('Selected campuses & SMK', 'Kampus & SMK terpilih') },
    { n: t('Phase 2', 'Fase 2'), name: t('Scale', 'Skala'), year: '2028', partners: '40', learners: t('75K', '75 rb'), note: t('Career centres & regions', 'Career center & daerah') },
    { n: t('Phase 3', 'Fase 3'), name: t('National', 'Nasional'), year: '2029', partners: '100', learners: t('250K', '250 rb'), note: t('Open to every learner', 'Terbuka untuk semua pelajar') },
  ];

  return (
    <section id="impact" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="container-orbit">
        <Chapter n="07" label={t('Impact', 'Dampak')} center />
        <Heading center className="max-w-4xl">
          {t('From learning without direction', 'Dari belajar tanpa arah,')} <span className="orbit-gradient-text">{t('to graduates ready to work.', 'menjadi lulusan yang siap berkarya.')}</span>
        </Heading>
        <Lead center>{t('How Orbit creates change — and the targets we hold ourselves to.', 'Bagaimana Orbit menciptakan perubahan — dan target yang ingin kami capai.')}</Lead>

        {/* Impact chain */}
        <motion.ol variants={stagger(0.12)} {...reveal} className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {chain.map((c, i) => (
            <motion.li key={c.title} variants={fadeUp} className="relative">
              <div className={cn('card h-full p-5', i === chain.length - 1 && 'border-green/30 bg-gradient-to-br from-mint to-surface')}>
                <div className="flex items-center justify-between">
                  <span className={cn('flex size-10 items-center justify-center rounded-xl', i === chain.length - 1 ? 'bg-green text-white shadow-green' : 'bg-muted-green text-green-strong dark:text-green')}>
                    <c.icon className="size-[18px]" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-subtle-foreground">{c.tag}</span>
                </div>
                <h3 className="mt-4 font-display text-[17px] font-bold leading-snug">{c.title}</h3>
                <p className="mt-1.5 text-[13.5px] text-muted-foreground">{c.body}</p>
              </div>
              {i < chain.length - 1 && (
                <span className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-green lg:flex" aria-hidden>
                  <ArrowRight className="size-3.5" />
                </span>
              )}
            </motion.li>
          ))}
        </motion.ol>

        {/* KPI targets */}
        <div className="mt-16 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">{t('KPI targets', 'Target KPI')}</div>
            <h3 className="mt-1 font-display text-[24px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t('What success looks like', 'Seperti apa keberhasilan itu')}</h3>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted-orange px-3 py-1 text-[12px] font-semibold text-orange-strong dark:text-orange">
            <Flag className="size-3.5" /> {t('Targets & projections — measured with anonymised, aggregate data', 'Target & proyeksi — diukur dengan data agregat anonim')}
          </span>
        </div>
        <motion.ul variants={stagger(0.06)} {...reveal} className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <motion.li key={k.label} variants={fadeUp} className="card card-interactive flex flex-col p-5">
              <k.icon className="size-5 text-green" aria-hidden />
              <div className="tabular mt-4 font-display text-[30px] font-extrabold leading-none tracking-[-0.035em] sm:text-[36px]">{k.value}</div>
              <div className="mt-2 text-[13.5px] font-medium leading-snug">{k.label}</div>
              <div className="mt-auto pt-3 text-[12px] font-semibold text-muted-foreground">{k.when}</div>
            </motion.li>
          ))}
        </motion.ul>

        {/* Rollout */}
        <div className="mt-16">
          <div className="eyebrow">{t('Reach projection', 'Proyeksi jangkauan')}</div>
          <h3 className="mt-1 font-display text-[24px] font-extrabold tracking-[-0.03em] sm:text-[28px]">{t('Pilot first, then scale nationally', 'Mulai dari pilot, lalu skala nasional')}</h3>
          <motion.ol variants={stagger(0.15)} {...reveal} className="mt-6 grid items-end gap-3 md:grid-cols-3">
            {phases.map((p, i) => (
              <motion.li key={p.year} variants={fadeUp} className={cn('relative overflow-hidden rounded-[22px] border p-6', i === 2 ? 'border-transparent bg-[#0f1d16] text-white shadow-pop' : 'border-border bg-surface shadow-card')} style={{ minHeight: 190 + i * 40 }}>
                {i === 2 && <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-green/35 blur-3xl" aria-hidden />}
                <div className="relative flex items-center justify-between">
                  <span className={cn('text-[12px] font-bold uppercase tracking-[0.12em]', i === 2 ? 'text-white/55' : 'text-muted-foreground')}>
                    {p.n} · {p.year}
                  </span>
                  <span className={cn('tabular font-display text-[13px] font-bold', i === 2 ? 'text-green' : 'text-green-strong dark:text-green')}>{p.name}</span>
                </div>
                <div className="relative mt-6 flex items-end gap-6">
                  <div>
                    <div className="tabular font-display text-[36px] font-extrabold leading-none tracking-[-0.04em]">{p.learners}</div>
                    <div className={cn('mt-1 text-[12.5px]', i === 2 ? 'text-white/60' : 'text-muted-foreground')}>{t('learners', 'pelajar')}</div>
                  </div>
                  <div>
                    <div className="tabular font-display text-[24px] font-extrabold leading-none tracking-[-0.03em]">{p.partners}</div>
                    <div className={cn('mt-1 text-[12.5px]', i === 2 ? 'text-white/60' : 'text-muted-foreground')}>{t('partners', 'mitra')}</div>
                  </div>
                </div>
                <p className={cn('relative mt-4 text-[13.5px]', i === 2 ? 'text-white/70' : 'text-muted-foreground')}>{p.note}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────── SDGs

export function SdgContributionSection() {
  const { t } = useT();
  const sdg4 = [
    { code: '4.3', text: t('Equal access to quality vocational & tertiary education — free guidance, anytime.', 'Akses setara ke pendidikan vokasi & tinggi berkualitas — panduan gratis, kapan saja.') },
    { code: '4.4', text: t('More youth with relevant skills for decent work — every class mapped to demand.', 'Lebih banyak pemuda dengan skill relevan untuk kerja layak — tiap pelajaran dipetakan ke kebutuhan.') },
    { code: '4.5', text: t('Fewer disparities — bilingual, mobile-first, no cost.', 'Kesenjangan berkurang — dwibahasa, ramah ponsel, tanpa biaya.') },
  ];
  const others = [
    { n: '8', color: '#A21942', name: t('Decent work & economic growth', 'Pekerjaan layak & pertumbuhan ekonomi'), target: '8.6', text: t('Cut the share of youth not in work, education or training.', 'Menurunkan proporsi pemuda yang tidak bekerja, sekolah, atau pelatihan (NEET).') },
    { n: '10', color: '#DD1367', name: t('Reduced inequalities', 'Berkurangnya kesenjangan'), target: '10.2', text: t('Career guidance no longer depends on who you know.', 'Bimbingan karier tak lagi bergantung pada siapa yang kamu kenal.') },
  ];
  const who: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: GraduationCap, title: t('Learners', 'Pelajar'), body: t('Direction, motivation and visible progress.', 'Arah, motivasi, dan progres yang terlihat.') },
    { icon: School, title: t('Schools & campuses', 'Sekolah & kampus'), body: t('Aggregate insight for curriculum and advising.', 'Insight agregat untuk kurikulum & bimbingan.') },
    { icon: Briefcase, title: t('Industry', 'Industri'), body: t('Talent that’s ready sooner, cheaper to onboard.', 'Talenta lebih cepat siap, biaya pelatihan turun.') },
    { icon: HeartHandshake, title: 'Indonesia', body: t('A demographic dividend that works — toward Indonesia Emas 2045.', 'Bonus demografi yang produktif — menuju Indonesia Emas 2045.') },
  ];
  return (
    <section id="sdg" className="relative scroll-mt-20 overflow-hidden border-y border-border bg-surface-2/40 py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-40 top-10 size-[460px] rounded-full blur-3xl" style={{ background: 'rgba(197,25,45,0.06)' }} aria-hidden />
      <div className="container-orbit relative">
        <div className="grid items-end gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <Chapter n="08" label={t('Contribution', 'Kontribusi')} />
            <Heading>{t('Built for SDG 4 — with ripple effects beyond it.', 'Dibangun untuk SDG 4 — dengan dampak yang meluas.')}</Heading>
          </div>
          <Lead className="lg:mb-1">{t('Smart education and campus innovation, measured by real readiness.', 'Smart education dan inovasi kampus, diukur dari kesiapan nyata.')}</Lead>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="card overflow-hidden">
            <div className="flex items-center gap-4 p-6 text-white sm:p-7" style={{ background: SDG4_RED }}>
              <span className="font-display text-[56px] font-extrabold leading-none">4</span>
              <div>
                <div className="font-display text-[18px] font-extrabold uppercase leading-tight tracking-wide">{t('Quality education', 'Pendidikan berkualitas')}</div>
                <div className="text-[13px] text-white/80">{t('Primary goal · Smart Education & Campus Innovation', 'Tujuan utama · Smart Education & Inovasi Kampus')}</div>
              </div>
              <BookOpenCheck className="ml-auto hidden size-12 opacity-90 sm:block" strokeWidth={1.6} aria-hidden />
            </div>
            <ul className="divide-y divide-border">
              {sdg4.map((x) => (
                <li key={x.code} className="flex items-start gap-4 p-5 sm:px-7">
                  <span className="tabular flex h-9 w-12 shrink-0 items-center justify-center rounded-lg font-display text-[14px] font-extrabold text-white" style={{ background: SDG4_RED }}>
                    {x.code}
                  </span>
                  <p className="text-[14.5px] leading-relaxed">{x.text}</p>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={stagger(0.1)} {...reveal} className="grid gap-4">
            {others.map((o) => (
              <motion.div key={o.n} variants={fadeUp} className="card flex gap-4 p-5 sm:p-6">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl font-display text-[24px] font-extrabold text-white" style={{ background: o.color }}>
                  {o.n}
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    SDG {o.n} · {t('Target', 'Target')} {o.target}
                  </div>
                  <h3 className="mt-0.5 font-display text-[16px] font-bold leading-snug">{o.name}</h3>
                  <p className="mt-1 text-[13.5px] text-muted-foreground">{o.text}</p>
                </div>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className="flex items-center gap-3 rounded-2xl border border-green/25 bg-muted-green/60 p-4 text-[13.5px] font-semibold">
              <Scale className="size-5 shrink-0 text-green" /> {t('Aligned with Indonesia’s link-and-match agenda for education and work.', 'Selaras dengan agenda link and match pendidikan dan dunia kerja di Indonesia.')}
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-14 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{t('Who feels the impact', 'Siapa yang merasakan dampaknya')}</div>
        <motion.ul variants={stagger(0.08)} {...reveal} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {who.map((w) => (
            <motion.li key={w.title} variants={fadeUp} className="rounded-2xl border border-border bg-surface p-5">
              <w.icon className="size-5 text-green" aria-hidden />
              <h3 className="mt-3 font-display text-[16px] font-bold">{w.title}</h3>
              <p className="mt-1 text-[13.5px] text-muted-foreground">{w.body}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────── Closing

export function ClosingSection() {
  const { t } = useT();
  const mode = useOrbit((s) => s.mode);
  const before = [t('Afraid of becoming a statistic', 'Takut menjadi angka statistik'), t('No idea what classes are for', 'Tak tahu gunanya mata kuliah'), t('12 courses saved, 1 finished', '12 kursus disimpan, 1 selesai'), t('Opportunities scattered everywhere', 'Info peluang tercecer'), t('Skill gaps found in the final year', 'Gap skill ketahuan di akhir')];
  const after = [t('Clear goal: Product Manager', 'Tujuan jelas: Product Manager'), t('Every class linked to that goal', 'Setiap kelas terhubung ke tujuannya'), t('A roadmap and weekly quests', 'Roadmap dan quest mingguan'), t('Matched opportunities in one place', 'Peluang yang cocok di satu tempat'), t('One next best action, every day', 'Satu next best action setiap hari')];
  return (
    <section id="closing" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_bottom,#000_20%,transparent_70%)]" aria-hidden />
      <div className="container-orbit relative">
        <Heading center className="max-w-3xl">
          {t('Naya, with Orbit:', 'Naya, bersama Orbit:')} <span className="orbit-gradient-text">{t('no longer afraid.', 'tak lagi takut.')}</span>
        </Heading>

        <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="rounded-[24px] border border-border bg-surface-2/60 p-6 sm:p-7">
            <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t('Before Orbit', 'Sebelum Orbit')}</div>
            <ul className="mt-5 space-y-3">
              {before.map((b) => (
                <li key={b} className="flex gap-3 text-[14.5px] text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-danger text-danger">
                    <X className="size-3" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
          <div className="flex items-center justify-center" aria-hidden>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: 0.2 }} className="orbit-gradient flex size-12 rotate-90 items-center justify-center rounded-full text-white shadow-green md:rotate-0">
              <ArrowRight className="size-5" />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: 0.1 }} className="relative overflow-hidden rounded-[24px] border border-green/30 bg-gradient-to-br from-mint to-surface p-6 shadow-card sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-green-strong dark:text-green">{t('With Orbit', 'Bersama Orbit')}</div>
              <ReadinessRing score={74} size={64} stroke={6} showBand={false} className="-mr-1 -mt-2" />
            </div>
            <ul className="mt-2 space-y-3">
              {after.map((a) => (
                <li key={a} className="flex gap-3 text-[14.5px] font-medium">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="mx-auto mt-16 max-w-3xl text-center">
          <p className="font-display text-[26px] font-extrabold leading-snug tracking-[-0.03em] sm:text-[34px]">{t('Every lesson, aimed at your future.', 'Setiap pelajaran, terarah ke masa depanmu.')}</p>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-muted-foreground">{t('Build your own orbit in a few minutes — or step into Naya’s.', 'Bangun orbit-mu sendiri dalam beberapa menit — atau coba orbit milik Naya.')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="xl" asChild>
              <Link to={mode === 'none' ? '/start' : '/app'}>
                {mode === 'none' ? t('Build My Orbit', 'Bangun Orbit Saya') : t('Open my Orbit', 'Buka Orbit saya')} <ArrowRight />
              </Link>
            </Button>
            <Button size="xl" variant="secondary" asChild>
              <Link to="/start?demo=1">
                <PlayCircle /> {t('Try the demo as Naya', 'Coba demo sebagai Naya')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SourcesSection() {
  const { t, l } = useT();
  return (
    <section id="sources" className="scroll-mt-20 pb-20">
      <div className="container-orbit">
        <details className="group mx-auto max-w-4xl rounded-[22px] border border-border bg-surface shadow-xs">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2.5 font-display text-[15px] font-bold">
              <BookOpenCheck className="size-[18px] text-green" /> {t('Sources & notes', 'Sumber & catatan')}
              <span className="tabular rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-bold text-muted-foreground">{SOURCES.length}</span>
            </span>
            <ArrowRight className="size-4 text-subtle-foreground transition-transform group-open:rotate-90" />
          </summary>
          <div className="border-t border-border px-5 pb-5 pt-2 sm:px-6">
            <ol className="divide-y divide-border">
              {SOURCES.map((s, i) => (
                <li key={s.id} className="flex items-start gap-3 py-3 text-[13.5px]">
                  <span className="tabular mt-0.5 w-5 shrink-0 text-subtle-foreground">{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold">{s.org}</span> <span className="text-muted-foreground">({s.year})</span> — {l(s.title)}
                  </div>
                  <a href={s.url} target="_blank" rel="noreferrer noopener" className="shrink-0 rounded-lg p-1 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground" aria-label={t('Open source (new tab)', 'Buka sumber (tab baru)')}>
                    <ExternalLink className="size-4" />
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-xl bg-surface-2 p-3 text-[12.5px] leading-relaxed text-muted-foreground">
              {t(
                'Statistics are quoted from official releases and the media outlets that reported them. KPI and reach figures are Orbit’s own targets and projections, not achieved results. Naya is a representative persona built from the research above.',
                'Statistik dikutip dari rilis resmi dan media yang memberitakannya. Angka KPI dan jangkauan adalah target dan proyeksi Orbit, bukan hasil yang sudah tercapai. Naya adalah persona representatif yang disusun dari riset di atas.',
              )}
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
