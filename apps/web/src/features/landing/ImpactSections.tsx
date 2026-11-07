import { useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpenCheck, Building2, Clock, Compass, GraduationCap, LifeBuoy, Minus, Plus, Presentation, Route, School, Sparkles, Target, TrendingUp, UserRound, UsersRound, X, Check, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/brand/brand';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { Section, SectionIntro } from './chrome';
import { SDG4_RED } from './MissionSection';

export function ImpactSection() {
  const { t } = useT();
  const before = [
    t('Studying for the exam without knowing why the class matters', 'Belajar demi ujian tanpa tahu kenapa pelajaran itu penting'),
    t('Guessing which skill to learn next, from scattered sites', 'Menebak skill berikutnya dari situs yang tercecer'),
    t('Career preparation starts only in the final semester', 'Persiapan karier baru dimulai di semester akhir'),
    t('No way to tell if effort is paying off', 'Tidak tahu apakah usaha membuahkan hasil'),
  ];
  const after = [
    t('Every class linked to the career it powers', 'Setiap pelajaran terhubung ke karier yang didukungnya'),
    t('Gaps ranked by importance and real demand', 'Gap diurutkan berdasarkan kepentingan dan permintaan nyata'),
    t('Readiness built semester by semester, from day one', 'Kesiapan dibangun semester demi semester, sejak hari pertama'),
    t('A readiness score that moves with every quest', 'Skor kesiapan yang bergerak di setiap quest'),
  ];
  return (
    <Section id="impact">
      <div className="container-orbit">
        <SectionIntro center eyebrow={t('Impact', 'Dampak')} title={t('From scattered studying to focused growth.', 'Dari belajar yang tercecer ke pertumbuhan yang fokus.')} desc={t('What Orbit is designed to change for every learner who uses it — at school, on campus and after graduation.', 'Apa yang dirancang Orbit untuk berubah bagi setiap pelajar yang menggunakannya — di sekolah, di kampus, dan setelah lulus.')} />
        <motion.div variants={stagger(0.08)} {...reveal} className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: Clock, value: <><span className="text-muted-foreground line-through decoration-2">3–5h</span> → 30m</>, label: t('Weekly planning time, targeted', 'Target waktu perencanaan mingguan') },
            { icon: Target, value: <CountUp value={1} />, label: t('Clear next best action, always', 'Next best action yang jelas, selalu') },
            { icon: TrendingUp, value: <CountUp value={6} />, label: t('Readiness dimensions, all explained', 'Dimensi kesiapan, semuanya dijelaskan') },
            { icon: GraduationCap, value: <CountUp value={100} suffix="%" />, label: t('Classes mapped to a career reason', 'Pelajaran terpetakan ke alasan karier') },
          ].map((m) => (
            <motion.div key={m.label} variants={fadeUp} className="card p-6">
              <m.icon className="size-5 text-green" />
              <div className="mt-4 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] sm:text-[38px]">{m.value}</div>
              <div className="mt-2 text-[13.5px] text-muted-foreground">{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={stagger(0.1)} {...reveal} className="mt-6 grid gap-4 md:grid-cols-2">
          <motion.div variants={fadeUp} className="rounded-[24px] border border-border bg-surface-2/50 p-6 sm:p-7">
            <div className="text-[12.5px] font-bold uppercase tracking-wider text-muted-foreground">{t('Without Orbit', 'Tanpa Orbit')}</div>
            <ul className="mt-5 space-y-3.5">
              {before.map((b) => (
                <li key={b} className="flex gap-3 text-[15px] text-muted-foreground">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted-danger text-danger">
                    <X className="size-3.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[24px] border border-green/30 bg-gradient-to-br from-mint to-surface p-6 shadow-card sm:p-7">
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-green/15 blur-2xl" aria-hidden />
            <div className="relative text-[12.5px] font-bold uppercase tracking-wider text-green-strong dark:text-green">{t('With Orbit', 'Dengan Orbit')}</div>
            <ul className="relative mt-5 space-y-3.5">
              {after.map((b) => (
                <li key={b} className="flex gap-3 text-[15px] font-medium">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

export function CampusTeaser() {
  const { t } = useT();
  return (
    <Section id="campus" className="overflow-hidden">
      <div className="container-orbit">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-surface p-6 shadow-hover sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-green/10 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionIntro
                eyebrow={t('Campus Innovation', 'Inovasi Kampus')}
                title={t('Where curriculum meets career — with data.', 'Saat kurikulum bertemu karier — dengan data.')}
                desc={t(
                  'Orbit turns individual learning journeys into anonymised campus insight. Lecturers, academic advisors and career centers see which skills a cohort is missing and which courses feed them — so programs and advising are planned from evidence, not guesswork.',
                  'Orbit mengubah perjalanan belajar individu menjadi insight kampus yang dianonimkan. Dosen, dosen pembimbing akademik, dan career center melihat skill yang kurang di suatu angkatan dan mata kuliah yang mendukungnya — sehingga program dan bimbingan direncanakan dari bukti, bukan tebakan.',
                )}
              />
              <ol className="mt-8 flex flex-wrap items-center gap-2 text-[13.5px] font-semibold">
                {[t('Learner', 'Pelajar'), t('Lecturer & Advisor', 'Dosen & Pembimbing'), t('Curriculum', 'Kurikulum'), t('Industry', 'Industri')].map((s, i, arr) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className={cn('rounded-full px-3 py-1.5', i % 2 ? 'bg-muted-orange text-orange-strong dark:text-orange' : 'bg-muted-green text-green-strong dark:text-green')}>{s}</span>
                    {i < arr.length - 1 && <ArrowRight className="size-4 text-subtle-foreground" />}
                  </li>
                ))}
              </ol>
              <Button size="lg" asChild className="mt-8">
                <Link to="/campus">
                  <Building2 /> {t('Explore Campus Innovation', 'Jelajahi Inovasi Kampus')}
                </Link>
              </Button>
            </div>
            <motion.div initial={{ opacity: 0, y: 20, rotate: 1.5 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} className="rounded-[24px] border border-border bg-background p-4 shadow-pop sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">Campus Intelligence</div>
                  <div className="font-display text-[15px] font-bold">{t('All faculties · this semester', 'Semua fakultas · semester ini')}</div>
                </div>
                <span className="rounded-full bg-muted-green px-2.5 py-1 text-[11.5px] font-bold text-green-strong dark:text-green">+5.4%</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: UsersRound, v: 1284, s: '', l: t('Students', 'Mahasiswa') },
                  { icon: TrendingUp, v: 72, s: '%', l: t('Avg. readiness', 'Rata-rata kesiapan') },
                  { icon: LifeBuoy, v: 183, s: '', l: t('Need guidance', 'Butuh bimbingan') },
                ].map((k) => (
                  <div key={k.l} className="rounded-2xl border border-border bg-surface p-3">
                    <k.icon className="size-4 text-green" />
                    <div className="mt-2 font-display text-[22px] font-extrabold leading-none">
                      <CountUp value={k.v} suffix={k.s} />
                    </div>
                    <div className="mt-1 text-[11.5px] text-muted-foreground">{k.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-2xl border border-border bg-surface p-4">
                <div className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{t('Top skill gaps', 'Gap skill teratas')}</div>
                <ul className="mt-3 space-y-2.5">
                  {[
                    ['Data Analytics', 46],
                    ['Public Speaking', 41],
                    ['Product Strategy', 37],
                    [t('Interview Skills', 'Skill Wawancara'), 35],
                    ['SQL', 31],
                  ].map(([k, v], i) => (
                    <li key={k as string} className="grid grid-cols-[110px_1fr_34px] items-center gap-3 text-[12.5px]">
                      <span className="truncate font-medium">{k}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <motion.span className={cn('block h-full rounded-full', i === 0 ? 'bg-orange' : 'bg-green')} initial={{ width: 0 }} whileInView={{ width: `${(v as number) * 1.6}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease, delay: i * 0.08 }} />
                      </span>
                      <span className="tabular text-right font-bold">{v}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function SdgSection() {
  const { t } = useT();
  const targets = [
    {
      code: '4.3',
      goal: t('Equal access to quality technical, vocational and tertiary education', 'Akses setara ke pendidikan vokasi, teknik, dan tinggi yang berkualitas'),
      how: t('Goal-centred learning guidance for SMA/SMK students, university students and graduates alike — free in the browser, anytime, not only during a counselling appointment.', 'Panduan belajar yang berpusat pada tujuan untuk siswa SMA/SMK, mahasiswa, dan lulusan — gratis di browser, kapan saja, bukan hanya saat jadwal konseling.'),
    },
    {
      code: '4.4',
      goal: t('More youth and adults with relevant skills for decent work', 'Lebih banyak pemuda dan orang dewasa dengan skill relevan untuk pekerjaan layak'),
      how: t('Every class is mapped to the skills employers actually ask for, and gaps are ranked by real demand — so learning effort flows to what builds employability.', 'Setiap pelajaran dipetakan ke skill yang benar-benar dicari perusahaan, dan gap diurutkan dari permintaan nyata — sehingga usaha belajar mengalir ke hal yang membangun employability.'),
    },
    {
      code: '4.5',
      goal: t('Eliminate disparities in access to education', 'Menghapus kesenjangan akses pendidikan'),
      how: t('Bilingual (EN/ID), no cost, mobile-friendly and private by default — knowing why you learn no longer depends on who you know.', 'Dwibahasa (EN/ID), tanpa biaya, nyaman di ponsel, dan privat — tahu alasan belajar tidak lagi bergantung pada siapa yang kamu kenal.'),
    },
  ];
  const flow = [
    { icon: BookOpenCheck, label: t('Learn', 'Belajar') },
    { icon: Target, label: t('Relevant skills', 'Skill relevan') },
    { icon: TrendingUp, label: t('Career readiness', 'Kesiapan karier') },
    { icon: GraduationCap, label: t('Decent work', 'Pekerjaan layak') },
  ];
  const items = [
    { icon: Compass, title: t('Learning with a destination', 'Belajar dengan tujuan'), body: t('Every class, course and quest is tied to a career goal and its real requirements.', 'Setiap pelajaran, kursus, dan quest terhubung ke tujuan karier dan kebutuhan nyatanya.') },
    { icon: Target, title: t('Relevant skills, identified early', 'Skill relevan, teridentifikasi lebih awal'), body: t('Learners see which skills matter from semester one — not in the last month before graduating.', 'Pelajar melihat skill penting sejak semester satu — bukan sebulan sebelum lulus.') },
    { icon: Recycle, title: t('Continuous, efficient learning', 'Belajar berkelanjutan dan efisien'), body: t('Less time wasted on scattered preparation, more on what moves readiness.', 'Lebih sedikit waktu terbuang, lebih banyak pada yang meningkatkan kesiapan.') },
    { icon: Building2, title: t('Data-informed institutions', 'Institusi berbasis data'), body: t('Schools and campuses shape programs and advising from aggregate gaps, not guesswork.', 'Sekolah dan kampus merancang program dan bimbingan dari gap agregat, bukan tebakan.') },
  ];
  return (
    <Section id="sdg" className="overflow-hidden bg-surface-2/40">
      <div className="pointer-events-none absolute -right-40 top-10 size-[480px] rounded-full blur-3xl" style={{ background: 'rgba(197,25,45,0.06)' }} aria-hidden />
      <div className="container-orbit relative">
        <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] [&>*]:min-w-0">
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="relative inline-flex aspect-square w-[180px] flex-col justify-between overflow-hidden rounded-[22px] p-5 text-white shadow-[0_24px_50px_-24px_rgba(197,25,45,0.9)] sm:w-[210px]"
              style={{ background: SDG4_RED }}
              role="img"
              aria-label={t('SDG 4: Quality Education', 'SDG 4: Pendidikan Berkualitas')}
            >
              <div className="flex items-start gap-3">
                <span className="font-display text-[56px] font-extrabold leading-[0.85]">4</span>
                <span className="mt-1 font-display text-[14px] font-extrabold uppercase leading-tight tracking-wide">{t('Quality education', 'Pendidikan berkualitas')}</span>
              </div>
              <BookOpenCheck className="size-14 self-center opacity-95" strokeWidth={1.6} aria-hidden />
              <span className="pointer-events-none absolute -bottom-10 -right-10 size-32 rounded-full border-[10px] border-white/10" aria-hidden />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }} className="mt-8 font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[52px]">
              {t('Learning should', 'Belajar seharusnya')} <span className="orbit-gradient-text">{t('lead somewhere.', 'membawa ke suatu tempat.')}</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: 0.1 }} className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
              {t(
                'Orbit supports SDG 4 — Quality Education — as a goal-centred learning system. Every class, course, project and roadmap a learner follows is connected to the skills and the career it leads to. Smart education, measured by real readiness.',
                'Orbit mendukung SDG 4 — Pendidikan Berkualitas — sebagai sistem belajar yang berpusat pada tujuan. Setiap pelajaran, kursus, proyek, dan roadmap yang diikuti pelajar terhubung ke skill dan karier yang ditujunya. Smart education, diukur dari kesiapan nyata.',
              )}
            </motion.p>
            <motion.ol variants={stagger(0.12, 0.2)} {...reveal} className="mt-7 flex flex-wrap items-center gap-2" aria-label={t('How learning leads to work', 'Bagaimana belajar membawa ke pekerjaan')}>
              {flow.map((f, i) => (
                <motion.li key={f.label} variants={fadeUp} className="flex items-center gap-2">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold', i === flow.length - 1 ? 'border-green/30 bg-muted-green text-green-strong dark:text-green' : 'border-border bg-surface')}>
                    <f.icon className="size-3.5" aria-hidden />
                    {f.label}
                  </span>
                  {i < flow.length - 1 && <ArrowRight className="size-4 text-subtle-foreground" aria-hidden />}
                </motion.li>
              ))}
            </motion.ol>
          </div>

          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="eyebrow">
              {t('SDG 4 targets Orbit contributes to', 'Target SDG 4 yang didukung Orbit')}
            </motion.div>
            <motion.ul variants={stagger(0.1)} {...reveal} className="mt-4 space-y-3">
              {targets.map((x) => (
                <motion.li key={x.code} variants={fadeUp} className="card card-interactive flex gap-4 p-5 sm:p-6">
                  <span className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl font-display text-white" style={{ background: SDG4_RED }}>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-80">{t('Target', 'Target')}</span>
                    <span className="text-[17px] font-extrabold leading-none">{x.code}</span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[16.5px] font-bold leading-snug">{x.goal}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">{t('How Orbit helps:', 'Peran Orbit:')}</span> {x.how}
                    </p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={stagger(0.08)} {...reveal} className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((x) => (
                <motion.div key={x.title} variants={fadeUp} className="rounded-2xl border border-border bg-surface p-5">
                  <x.icon className="size-5 text-green" aria-hidden />
                  <h3 className="mt-3 font-display text-[15px] font-bold leading-snug">{x.title}</h3>
                  <p className="mt-1 text-[13.5px] text-muted-foreground">{x.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        <ComplementBlock />
      </div>
    </Section>
  );
}

/** Orbit's role in the learning ecosystem: it complements schools, campuses and educators — it never replaces them. */
function ComplementBlock() {
  const { t } = useT();
  const lanes = [
    {
      icon: Presentation,
      who: t('Schools, campuses & educators', 'Sekolah, kampus & pendidik'),
      role: t('Teach · assess · mentor', 'Mengajar · menilai · membimbing'),
      tone: 'neutral' as const,
      points: [
        t('Deliver the curriculum and grade learning', 'Menyampaikan kurikulum dan menilai pembelajaran'),
        t('Guide learners as teachers, lecturers and advisors', 'Membimbing sebagai guru, dosen, dan pembimbing akademik'),
        t('Award the certificate and the degree', 'Memberikan ijazah dan gelar'),
      ],
    },
    {
      icon: Route,
      who: 'Orbit',
      role: t('Focus · connect · track', 'Memfokuskan · menghubungkan · memantau'),
      tone: 'green' as const,
      points: [
        t('Maps every class to the career it powers', 'Memetakan setiap pelajaran ke karier yang didukungnya'),
        t('Ranks what to learn next by real demand', 'Mengurutkan yang perlu dipelajari berikutnya dari permintaan nyata'),
        t('Turns progress into a visible roadmap and score', 'Mengubah progres menjadi roadmap dan skor yang terlihat'),
      ],
    },
    {
      icon: UserRound,
      who: t('You, the learner', 'Kamu, sang pelajar'),
      role: t('Learn smarter, with purpose', 'Belajar lebih cerdas, dengan tujuan'),
      tone: 'orange' as const,
      points: [
        t('Know why each lesson matters', 'Tahu kenapa setiap pelajaran penting'),
        t('Spend effort where it counts most', 'Mencurahkan usaha di tempat yang paling berdampak'),
        t('Graduate career-ready, not only graduated', 'Lulus dalam keadaan siap berkarier, bukan sekadar lulus'),
      ],
    },
  ];
  const nots = [
    t('Not an online course that replaces lectures', 'Bukan kursus online pengganti perkuliahan'),
    t('Not a grading or attendance system', 'Bukan sistem penilaian atau presensi'),
    t('Not a substitute for teachers, counsellors or advisors', 'Bukan pengganti guru, konselor, atau dosen pembimbing'),
  ];
  const audience = [
    { icon: School, label: t('SMA/SMK students', 'Siswa SMA/SMK') },
    { icon: GraduationCap, label: t('University students', 'Mahasiswa') },
    { icon: Sparkles, label: t('Fresh graduates', 'Fresh graduate') },
    { icon: UsersRound, label: t('Job seekers', 'Pencari kerja') },
  ];
  return (
    <motion.div
      id="complement"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease }}
      className="relative mt-16 scroll-mt-24 overflow-hidden rounded-[32px] border border-border bg-surface p-6 shadow-hover sm:p-10"
    >
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-green/10 blur-3xl" aria-hidden />
      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-[0.1em] text-white" style={{ background: SDG4_RED }}>
            {t('Our role in education', 'Peran kami dalam pendidikan')}
          </div>
          <h3 className="mt-4 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[38px]">
            {t('Orbit doesn’t replace your school, campus or lecturers.', 'Orbit tidak menggantikan sekolah, kampus, atau dosenmu.')} <span className="orbit-gradient-text">{t('It connects what they teach to where you’re going.', 'Orbit menghubungkan apa yang mereka ajarkan ke tujuanmu.')}</span>
          </h3>
        </div>
        <p className="text-[15.5px] leading-relaxed text-muted-foreground sm:text-[16.5px]">
          {t(
            'Educators remain the heart of learning. Orbit is the layer around it that gives every learner — students, fresh graduates and job seekers — one goal-centred system: learning materials, roadmaps and progress all pointed at the career they want, so they learn smarter and more precisely.',
            'Pendidik tetap menjadi jantung pembelajaran. Orbit adalah lapisan di sekitarnya yang memberi setiap pelajar — siswa, mahasiswa, fresh graduate, dan pencari kerja — satu sistem yang berpusat pada tujuan: materi belajar, roadmap, dan progres semuanya diarahkan ke karier yang diinginkan, sehingga mereka belajar lebih cerdas dan lebih tepat sasaran.',
          )}
        </p>
      </div>

      <motion.ol variants={stagger(0.12)} {...reveal} className="relative mt-10 grid gap-4 lg:grid-cols-3" aria-label={t('Who does what', 'Siapa melakukan apa')}>
        {lanes.map((lane, i) => (
          <motion.li key={lane.who} variants={fadeUp} className="relative">
            <div
              className={cn(
                'flex h-full flex-col rounded-[24px] border p-5 sm:p-6',
                lane.tone === 'green' ? 'border-green/35 bg-gradient-to-br from-mint to-surface shadow-card' : lane.tone === 'orange' ? 'border-orange/30 bg-gradient-to-br from-cream to-surface' : 'border-border bg-surface-2/60',
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', lane.tone === 'green' ? 'orbit-gradient text-white shadow-green' : lane.tone === 'orange' ? 'bg-orange text-white' : 'bg-surface text-foreground shadow-xs')}>
                  <lane.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-[17px] font-bold leading-tight">{lane.who}</div>
                  <div className={cn('text-[12.5px] font-semibold', lane.tone === 'green' ? 'text-green-strong dark:text-green' : lane.tone === 'orange' ? 'text-orange-strong dark:text-orange' : 'text-muted-foreground')}>{lane.role}</div>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5">
                {lane.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[14px] leading-snug">
                    <Check className={cn('mt-0.5 size-4 shrink-0', lane.tone === 'orange' ? 'text-orange' : 'text-green')} strokeWidth={2.6} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            {i < lanes.length - 1 && (
              <span className="absolute -right-[18px] top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-green shadow-card lg:flex" aria-hidden>
                <Plus className="size-4" strokeWidth={2.6} />
              </span>
            )}
          </motion.li>
        ))}
      </motion.ol>

      <div className="relative mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[20px] border border-dashed border-border-strong p-5">
          <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('What Orbit is not', 'Orbit bukan')}</div>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {nots.map((n) => (
              <li key={n} className="flex gap-2 text-[13.5px] leading-snug text-muted-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted-danger text-danger">
                  <X className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] font-medium text-foreground">{t('Instead, it gives educators better context — and learners a clearer reason to learn.', 'Sebaliknya, Orbit memberi pendidik konteks yang lebih baik — dan pelajar alasan belajar yang lebih jelas.')}</p>
        </div>
        <div className="rounded-[20px] border border-border bg-surface-2/50 p-5">
          <div className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('Built for every learner on the way to work', 'Untuk setiap pelajar menuju dunia kerja')}</div>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {audience.map((a) => (
              <li key={a.label} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-[13px] font-semibold shadow-xs">
                <a.icon className="size-4 shrink-0 text-green" aria-hidden />
                <span className="min-w-0">{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export function FaqSection() {
  const { t } = useT();
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: t('Does Orbit replace my school, campus or lecturers?', 'Apakah Orbit menggantikan sekolah, kampus, atau dosen?'), a: t('No. Teachers and lecturers still teach, assess and mentor you. Orbit is a goal-centred learning system around that: it shows how each class connects to the career you want, what to learn next and how far you have come — and it gives educators better context, not a smaller role.', 'Tidak. Guru dan dosen tetap mengajar, menilai, dan membimbingmu. Orbit adalah sistem belajar berpusat pada tujuan di sekitarnya: menunjukkan bagaimana setiap pelajaran terhubung ke karier yang kamu inginkan, apa yang dipelajari berikutnya, dan sejauh mana kemajuanmu — serta memberi pendidik konteks yang lebih baik, bukan mengurangi perannya.') },
    { q: t('Who is Orbit for?', 'Orbit untuk siapa?'), a: t('SMA/SMK students choosing a direction, university students, fresh graduates and job seekers — plus the schools, campuses and career centers that support them.', 'Siswa SMA/SMK yang sedang memilih arah, mahasiswa, fresh graduate, dan pencari kerja — serta sekolah, kampus, dan career center yang mendampingi mereka.') },
    { q: t('How does Orbit help me learn smarter?', 'Bagaimana Orbit membantu saya belajar lebih cerdas?'), a: t('The Learning Map reads your curriculum and shows, class by class, which career skills it builds and how relevant it is to your goal. It suggests an applied mini-project to turn each class into portfolio evidence and a question to bring to your lecturer — so effort goes where it counts.', 'Learning Map membaca kurikulummu dan menunjukkan, per pelajaran, skill karier yang dibangunnya dan seberapa relevan dengan tujuanmu. Orbit menyarankan proyek mini terapan untuk menjadikan setiap pelajaran bukti portofolio dan pertanyaan untuk dibawa ke dosen — sehingga usaha tercurah ke tempat yang tepat.') },
    { q: t('How is Career Readiness calculated?', 'Bagaimana Career Readiness dihitung?'), a: t('Orbit scores six dimensions — skills, experience, projects, education, portfolio and interview readiness — against what your target role expects. Each score shows why and what moves it.', 'Orbit menilai enam dimensi — skill, pengalaman, proyek, pendidikan, portofolio, dan kesiapan wawancara — terhadap ekspektasi peran targetmu. Setiap skor menunjukkan alasannya dan apa yang menggerakkannya.') },
    { q: t('Is Orbit a job portal?', 'Apakah Orbit portal lowongan kerja?'), a: t('No. Job seekers still find openings here, but Orbit is first a learning system: it connects classes, courses, mentors, projects, opportunities and progress into one roadmap, so you understand which action actually improves your readiness.', 'Bukan. Pencari kerja tetap bisa menemukan lowongan di sini, tetapi Orbit pertama-tama adalah sistem belajar: menghubungkan pelajaran, kursus, mentor, proyek, peluang, dan progres dalam satu roadmap, sehingga kamu memahami aksi mana yang benar-benar meningkatkan kesiapanmu.') },
    { q: t('Will Orbit change my plan automatically?', 'Apakah Orbit mengubah rencanaku secara otomatis?'), a: t('Never. Orbit recommends and explains; important changes to your journey always require your confirmation.', 'Tidak pernah. Orbit merekomendasikan dan menjelaskan; perubahan penting pada journey-mu selalu memerlukan konfirmasimu.') },
    { q: t('Where is my data stored?', 'Di mana dataku disimpan?'), a: t('Your Orbit is stored privately in your browser. You can export or reset it anytime from Settings. Campuses only see aggregated, anonymised insight.', 'Orbit-mu tersimpan privat di browser. Kamu bisa mengekspor atau meresetnya kapan saja di Pengaturan. Kampus hanya melihat insight agregat yang dianonimkan.') },
    { q: t('Can I try it without signing up?', 'Bisakah mencoba tanpa mendaftar?'), a: t('Yes — explore as Naya, a final-year student aiming for Product Manager, and experience every feature in about two minutes.', 'Ya — jelajahi sebagai Naya, mahasiswa tingkat akhir yang menargetkan Product Manager, dan rasakan semua fitur dalam sekitar dua menit.') },
  ];
  return (
    <Section id="faq">
      <div className="container-orbit grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionIntro eyebrow="FAQ" title={t('Questions, answered.', 'Pertanyaan, terjawab.')} desc={t('Still curious? Ask Orbit Agent inside the app — it explains everything it recommends.', 'Masih penasaran? Tanyakan pada Orbit Agent di dalam aplikasi — ia menjelaskan semua yang direkomendasikannya.')} />
        <ul className="space-y-3">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className={cn('overflow-hidden rounded-2xl border bg-surface transition-colors', on ? 'border-green/35 shadow-card' : 'border-border')}>
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} onClick={() => setOpen(on ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4.5 py-[18px] text-left font-display text-[16.5px] font-bold">
                    {f.q}
                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full transition-colors', on ? 'bg-green text-white' : 'bg-surface-2 text-muted-foreground')}>{on ? <Minus className="size-4" /> : <Plus className="size-4" />}</span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }}>
                      <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

export function FinalCta() {
  const { t } = useT();
  const mode = useOrbit((s) => s.mode);
  return (
    <section className="pb-24 pt-4">
      <div className="container-orbit">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} className="relative overflow-hidden rounded-[36px] bg-[#0d1813] px-6 py-16 text-center text-white sm:px-12 sm:py-24">
          <div className="pointer-events-none absolute -left-24 -top-24 size-[380px] rounded-full bg-green/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-32 -right-24 size-[380px] rounded-full bg-orange/20 blur-3xl" aria-hidden />
          {[260, 420, 600].map((s, i) => (
            <div key={s} className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-dashed border-white/10" style={{ width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, animation: `orbit-spin ${60 + i * 30}s linear infinite ${i % 2 ? 'reverse' : ''}` }} aria-hidden>
              <span className={cn('absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full', i === 1 ? 'bg-orange' : 'bg-green')} />
            </div>
          ))}
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-[60px]">
              {t('Learn with purpose.', 'Belajar dengan tujuan.')}
              <br />
              <span className="bg-gradient-to-r from-[#4ee39a] to-orange bg-clip-text text-transparent">{t('Grow into your career.', 'Tumbuh menuju kariermu.')}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] text-white/65">{t('Know why every lesson matters, focus on what counts, and always know your next step.', 'Pahami kenapa setiap pelajaran penting, fokus pada yang berdampak, dan selalu tahu langkah berikutnya.')}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="xl" asChild>
                <Link to={mode === 'none' ? '/start' : '/app'}>
                  {t('Build My Orbit', 'Bangun Orbit Saya')} <ArrowRight />
                </Link>
              </Button>
              <Button size="xl" variant="ghost" asChild className="border border-white/15 text-white hover:bg-white/10 hover:text-white">
                <Link to="/start?demo=1">{t('Explore the demo', 'Jelajahi demo')}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
