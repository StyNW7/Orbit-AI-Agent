import { motion } from 'motion/react';
import { ArrowRight, ChevronDown, Compass, GraduationCap, Puzzle, Quote, Unlink, type LucideIcon } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { scrollToId } from '@/features/landing/chrome';
import { BREAKDOWN, FINDINGS, fmt, type Finding } from './data';
import { Chapter, Heading, Lead, Num, SourceChip } from './parts';

const ALARM = 'linear-gradient(105deg, #FB9002 0%, #E2632A 45%, #C5192D 100%)';

const TONE: Record<Finding['tone'], string> = {
  orange: 'bg-muted-orange text-orange-strong dark:text-orange',
  danger: 'bg-muted-danger text-danger',
  violet: 'bg-muted-violet text-violet',
  info: 'bg-muted-info text-info',
  green: 'bg-muted-green text-green-strong dark:text-green',
};

// ─────────────────────────────────────────────────────────── 01 · The hook

export function HookSection() {
  const { t, l, locale } = useT();
  const grads = BREAKDOWN.filter((b) => b.graduate);
  const gradTotal = grads.reduce((s, b) => s + b.value, 0);
  const gradShare = grads.reduce((s, b) => s + b.share, 0);

  return (
    <section id="facts" className="relative scroll-mt-20 overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-80 [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_70%)]" aria-hidden />
      <div className="pointer-events-none absolute -top-48 left-1/2 size-[720px] -translate-x-1/2 rounded-full bg-orange/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-[-10%] top-40 size-[420px] rounded-full blur-3xl" style={{ background: 'rgba(197,25,45,0.07)' }} aria-hidden />

      <div className="container-orbit relative">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold shadow-xs">
            <span className="size-1.5 rounded-full bg-orange" aria-hidden />
            Why Orbit <span className="text-muted-foreground">· {t('The story behind it', 'Cerita di baliknya')}</span>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.1 }} className="mt-10 text-[16px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[17px]">
            {t('Today in Indonesia', 'Hari ini di Indonesia')}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.9, ease, delay: 0.18 }} className="mt-2 font-display font-extrabold leading-[0.88] tracking-[-0.06em]">
            <span className="block whitespace-nowrap text-[clamp(52px,17vw,150px)] lg:text-[188px]">
              <Num value={7.38} decimals={2} duration={2} />
              <span className="ml-3 bg-clip-text text-transparent sm:ml-5" style={{ backgroundImage: ALARM }}>
                {t('M', 'juta')}
              </span>
            </span>
            <span className="mt-6 block text-[28px] tracking-[-0.035em] sm:mt-8 sm:text-[40px] lg:text-[46px]">{t('people are unemployed.', 'orang menganggur.')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.4 }} className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
            {t('More than', 'Lebih dari')} <strong className="font-bold text-foreground">{t('{n} million', '{n} juta', { n: fmt(5, locale) })}</strong>{' '}
            {t('of them already finished high school, vocational school or university.', 'di antaranya sudah lulus SMA, SMK, atau perguruan tinggi.')}
          </motion.p>
        </div>

        {/* Stacked breakdown of the 7.38M */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease, delay: 0.1 }} className="mx-auto mt-14 max-w-4xl">
          <div className="relative mb-3 hidden sm:block" style={{ width: `${gradShare}%` }}>
            <div className="h-3 rounded-t-lg border-x-2 border-t-2 border-orange/60" aria-hidden />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-muted-orange px-2.5 py-0.5 text-[12px] font-bold text-orange-strong dark:text-orange">
              {t('{n}M graduates · {p}%', '{n} juta lulusan · {p}%', { n: fmt(gradTotal, locale, 2), p: fmt(gradShare, locale, 0) })}
            </div>
          </div>
          <div className="flex h-4 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={BREAKDOWN.map((b) => `${l(b.label)} ${fmt(b.share, locale, 1)}%`).join(', ')}>
            {BREAKDOWN.map((b, i) => (
              <motion.div
                key={b.key}
                initial={{ width: 0 }}
                whileInView={{ width: `${b.share}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease, delay: 0.25 + i * 0.12 }}
                className="h-full border-r-2 border-background last:border-r-0"
                style={{ background: b.color }}
              />
            ))}
          </div>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]">
            {BREAKDOWN.map((b) => (
              <li key={b.key} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: b.color }} aria-hidden />
                <span className={b.graduate ? 'font-semibold' : 'text-muted-foreground'}>{l(b.label)}</span>
                <span className="tabular text-muted-foreground">{fmt(b.share, locale, 1)}%</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={stagger(0.1)} {...reveal} className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3">
          {[
            { label: t('High school (SMA) graduates', 'Lulusan SMA'), value: 2.38, unit: t('million', 'juta'), dec: 2, color: BREAKDOWN[0].color },
            { label: t('Vocational (SMK) graduates', 'Lulusan SMK'), value: 1.83, unit: t('million', 'juta'), dec: 2, color: BREAKDOWN[1].color, note: t('Highest unemployment rate: {p}%', 'TPT tertinggi: {p}%', { p: fmt(8.2, locale, 2) }) },
            { label: t('University graduates (D4–S3)', 'Lulusan sarjana (D4–S3)'), value: 880, unit: t('thousand', 'ribu'), dec: 0, color: BREAKDOWN[2].color },
          ].map((c) => (
            <motion.div key={c.label} variants={fadeUp} className="card relative overflow-hidden p-5 text-left">
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: c.color }} aria-hidden />
              <div className="text-[13px] font-semibold text-muted-foreground">{c.label}</div>
              <div className="mt-2 flex items-baseline gap-1.5 font-display font-extrabold tracking-[-0.03em]">
                <Num value={c.value} decimals={c.dec} className="text-[38px] leading-none" />
                <span className="text-[17px] text-muted-foreground">{c.unit}</span>
              </div>
              {c.note && <div className="mt-2 inline-flex rounded-full bg-muted-danger px-2 py-0.5 text-[11.5px] font-bold text-danger">{c.note}</div>}
            </motion.div>
          ))}
        </motion.div>

        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-[12.5px] text-muted-foreground">
          <span>{t('Source: BPS, National Labour Force Survey (Sakernas), August 2026', 'Sumber: BPS, Survei Angkatan Kerja Nasional (Sakernas), Agustus 2026')}</span>
          <SourceChip id="bps-aug26" />
          <SourceChip id="bps-edu26" />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} className="mx-auto mt-20 max-w-3xl text-center">
          <p className="font-display text-[24px] font-bold leading-snug tracking-[-0.02em] text-muted-foreground sm:text-[30px]">{t('They went to school. They studied for years.', 'Mereka sudah sekolah. Sudah belajar bertahun-tahun.')}</p>
          <p className="mt-1 font-display text-[30px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[40px]">{t('So what was missing?', 'Lalu, apa yang hilang?')}</p>
          <button
            type="button"
            onClick={() => scrollToId('problem')}
            className="group mt-8 inline-flex flex-col items-center gap-2 text-[13px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            {t('Find out', 'Cari tahu')}
            <span className="flex size-11 items-center justify-center rounded-full border border-border bg-surface shadow-xs transition group-hover:border-border-strong group-hover:shadow-card">
              <ChevronDown className="size-5 animate-[float_2.4s_ease-in-out_infinite]" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────── 02 · The problem

export function ProblemSection() {
  const { t } = useT();
  const causes: { icon: LucideIcon; title: string; body: string; symptom: string }[] = [
    {
      icon: Compass,
      title: t('No destination', 'Tanpa tujuan'),
      body: t('Learning for grades and graduation — not for a career they’re aiming at.', 'Belajar demi nilai dan kelulusan — bukan demi karier yang dituju.'),
      symptom: t('“What will I ever use this for?”', '“Ini nanti dipakai buat apa?”'),
    },
    {
      icon: Unlink,
      title: t('No connection', 'Tanpa koneksi'),
      body: t('Classes are never linked to the skills the working world asks for.', 'Pelajaran di kelas tak pernah dihubungkan dengan skill yang dicari dunia kerja.'),
      symptom: t('“Why do job posts ask for things we never learned?”', '“Kok yang dicari lowongan beda dengan yang diajarkan?”'),
    },
    {
      icon: Puzzle,
      title: t('No support system', 'Tanpa sistem pendukung'),
      body: t('Internships, courses, events, mentors and books are scattered everywhere.', 'Magang, kursus, event, mentor, dan buku tercecer di mana-mana.'),
      symptom: t('“Which group chat had that internship again?”', '“Info magangnya ada di grup mana, ya?”'),
    },
  ];
  return (
    <section id="problem" className="relative scroll-mt-20 border-y border-border bg-surface-2/40 py-20 sm:py-28">
      <div className="container-orbit">
        <Chapter n="02" label={t('The problem', 'Masalahnya')} tone="orange" center />
        <Heading center className="max-w-4xl">
          {t('It isn’t a lack of studying.', 'Masalahnya bukan kurang belajar.')}{' '}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: ALARM }}>
            {t('It’s studying without direction.', 'Tapi belajar tanpa arah.')}
          </span>
        </Heading>
        <Lead center>
          {t(
            'Schools and campuses teach. But nothing ties lessons, skills and opportunities into one path towards a career.',
            'Sekolah dan kampus sudah mengajar. Tapi tak ada yang merangkai pelajaran, skill, dan peluang menjadi satu jalan menuju karier.',
          )}
        </Lead>

        <motion.ol variants={stagger(0.12)} {...reveal} className="mt-14 grid gap-4 md:grid-cols-3">
          {causes.map((c, i) => (
            <motion.li key={c.title} variants={fadeUp} className="card flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-muted-orange text-orange-strong dark:text-orange">
                  <c.icon className="size-5" />
                </span>
                <span className="tabular font-display text-[13px] font-bold text-subtle-foreground">{t('Cause', 'Akar')} 0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-[20px] font-bold">{c.title}</h3>
              <p className="mt-2 text-[14.5px] text-muted-foreground">{c.body}</p>
              <p className="mt-auto flex items-start gap-2 border-t border-dashed border-border pt-4 text-[13.5px] font-medium italic text-foreground/80">
                <Quote className="mt-0.5 size-3.5 shrink-0 text-orange" aria-hidden />
                {c.symptom}
              </p>
            </motion.li>
          ))}
        </motion.ol>

        {/* Three causes converge into one outcome */}
        <svg className="mx-auto hidden h-16 w-full max-w-[1176px] md:block" viewBox="0 0 600 64" preserveAspectRatio="none" aria-hidden>
          {[100, 300, 500].map((x, i) => (
            <motion.path
              key={x}
              d={`M ${x} 0 C ${x} 36, 300 28, 300 64`}
              fill="none"
              stroke="var(--orbit-orange)"
              strokeOpacity={0.55}
              strokeWidth={1.5}
              strokeDasharray="4 5"
              vectorEffect="non-scaling-stroke"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease, delay: 0.3 + i * 0.1 }}
            />
          ))}
        </svg>
        <div className="flex justify-center md:hidden" aria-hidden>
          <span className="my-3 h-10 w-px border-l-2 border-dashed border-orange/50" />
        </div>

        <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: 0.2 }} className="relative mx-auto max-w-2xl overflow-hidden rounded-[26px] bg-[#13201a] p-6 text-center text-white shadow-pop sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full blur-3xl" style={{ background: 'rgba(197,25,45,0.45)' }} aria-hidden />
          <span className="relative mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/10">
            <GraduationCap className="size-6 text-orange" />
          </span>
          <p className="relative mt-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">{t('The result', 'Hasilnya')}</p>
          <p className="relative mt-1 font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[32px]">{t('Graduated — but not ready to work.', 'Lulus — tapi belum siap kerja.')}</p>
          <button type="button" onClick={() => scrollToId('research')} className="relative mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-white/70 transition hover:text-white">
            {t('See what the data says', 'Lihat apa kata data')} <ArrowRight className="size-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────── 03 · Research

function FindingCard({ f, className }: { f: Finding; className?: string }) {
  const { l } = useT();
  return (
    <motion.article variants={fadeUp} className={cn('card card-interactive flex flex-col p-6', className)}>
      <span className={cn('flex size-10 items-center justify-center rounded-xl', TONE[f.tone])}>
        <f.icon className="size-[18px]" />
      </span>
      <div className="mt-5 font-display text-[44px] font-extrabold leading-none tracking-[-0.04em]">
        <Num value={f.value} decimals={f.decimals ?? 0} prefix={f.prefix} />
        <span className="text-[0.6em]">{l(f.suffix)}</span>
      </div>
      <p className="mt-3 text-[15px] font-semibold leading-snug">{l(f.claim)}</p>
      <p className="mt-2 flex gap-1.5 text-[13.5px] text-muted-foreground">
        <ArrowRight className="mt-[3px] size-3.5 shrink-0 text-green" aria-hidden />
        {l(f.why)}
      </p>
      <div className="mt-auto pt-5">
        <SourceChip id={f.source} />
      </div>
    </motion.article>
  );
}

export function ResearchSection() {
  const { t, l, locale } = useT();
  const [lead, ...rest] = FINDINGS;
  const share = 22; // ≈22.25% of 15–24 year-olds are NEET
  return (
    <section id="research" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="container-orbit">
        <div className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Chapter n="03" label={t('The research', 'Riset & data')} tone="orange" />
            <Heading>{t('The data agrees: this is real — and it’s happening to millions.', 'Data membuktikan: ini nyata — dan dialami jutaan pelajar.')}</Heading>
          </div>
          <Lead className="lg:mb-1">{t('Not an assumption. Five findings from official statistics and global research.', 'Bukan asumsi. Lima temuan dari statistik resmi dan riset global.')}</Lead>
        </div>

        <motion.div variants={stagger(0.08)} {...reveal} className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Lead finding: 1 in 5 young people */}
          <motion.article variants={fadeUp} className="relative flex flex-col overflow-hidden rounded-[20px] bg-[#13201a] p-6 text-white shadow-pop md:col-span-2 lg:col-span-1 lg:row-span-2 sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full blur-3xl" style={{ background: 'rgba(197,25,45,0.4)' }} aria-hidden />
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-white/10 text-orange">
              <lead.icon className="size-[18px]" />
            </span>
            <div className="relative mt-5 font-display text-[64px] font-extrabold leading-none tracking-[-0.05em] sm:text-[76px]">
              <Num value={lead.value} decimals={1} />
              <span className="text-[0.5em]">{l(lead.suffix)}</span>
            </div>
            <p className="relative mt-3 text-[16px] font-semibold leading-snug">{l(lead.claim)}</p>
            <div className="relative mt-6">
              <div className="grid grid-cols-10 gap-1.5" role="img" aria-label={t('About 1 in 5 young people', 'Sekitar 1 dari 5 anak muda')}>
                {Array.from({ length: 100 }, (_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + (i % 10) * 0.025 + Math.floor(i / 10) * 0.03 }}
                    className={cn('aspect-square rounded-full', i < share ? 'bg-orange shadow-[0_0_10px_rgba(251,144,2,0.55)]' : 'bg-white/12')}
                  />
                ))}
              </div>
              <p className="mt-3 text-[13px] font-semibold text-orange">{t('≈ 1 in 5 Indonesians aged 15–24 ({p}%)', '≈ 1 dari 5 penduduk usia 15–24 ({p}%)', { p: fmt(22.25, locale, 2) })}</p>
            </div>
            <p className="relative mt-4 flex gap-1.5 text-[13.5px] text-white/65">
              <ArrowRight className="mt-[3px] size-3.5 shrink-0 text-green" aria-hidden />
              {l(lead.why)}
            </p>
            <div className="relative mt-auto pt-5">
              <SourceChip id={lead.source} light />
            </div>
          </motion.article>
          {rest.map((f) => (
            <FindingCard key={f.source} f={f} />
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="relative mt-6 overflow-hidden rounded-[24px] border border-green/25 bg-gradient-to-br from-mint via-surface to-cream p-6 sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="eyebrow text-green-strong dark:text-green">{t('The common thread', 'Benang merahnya')}</div>
              <p className="mt-2 font-display text-[22px] font-bold leading-snug tracking-[-0.02em] sm:text-[26px]">
                {t('What’s missing isn’t the will to learn — it’s', 'Yang hilang bukan kemauan belajar — melainkan')}{' '}
                <span className="orbit-gradient-text">{t('direction, relevance and a system', 'arah, relevansi, dan sistem')}</span>{' '}
                {t('that connects learning to a career.', 'yang menghubungkan belajar dengan karier.')}
              </p>
            </div>
            <figure className="rounded-2xl border border-border bg-surface/80 p-5">
              <blockquote className="flex gap-2 text-[14px] font-medium leading-relaxed">
                <Quote className="mt-0.5 size-4 shrink-0 text-green" aria-hidden />
                {t('Choosing the wrong school or major is one of the drivers of Gen Z unemployment.', 'Salah memilih sekolah dan jurusan menjadi salah satu penyebab pengangguran Gen Z.')}
              </blockquote>
              <figcaption className="mt-3 flex items-center justify-between gap-2 text-[12.5px] text-muted-foreground">
                <span>{t('Bappenas, paraphrased', 'Bappenas, disarikan')}</span>
                <SourceChip id="bappenas" />
              </figcaption>
            </figure>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
