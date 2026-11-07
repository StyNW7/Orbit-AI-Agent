import { motion } from 'motion/react';
import { ArrowRight, Building2, Compass, GraduationCap, Route, School, UserRound } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { Section, SectionIntro, scrollToId } from './chrome';

/** Official SDG 4 colour (UN brand guidelines). */
export const SDG4_RED = '#C5192D';

export function Sdg4Mark({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'size-7 text-[13px] rounded-lg', md: 'size-10 text-[18px] rounded-xl', lg: 'size-16 text-[30px] rounded-2xl' }[size];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center font-display font-extrabold text-white shadow-[0_8px_20px_-10px_rgba(197,25,45,0.8)]', s, className)} style={{ background: SDG4_RED }} aria-hidden>
      4
    </span>
  );
}

/** Why Orbit exists: the purpose, the three pillars, who it serves — and its link to SDG 4. */
export function MissionSection() {
  const { t } = useT();
  const pillars = [
    {
      icon: Compass,
      step: '01',
      title: t('Set your destination', 'Tentukan tujuanmu'),
      body: t('Choose a career goal. Orbit maps the skills it needs and reads your readiness across six explained dimensions.', 'Pilih tujuan karier. Orbit memetakan skill yang dibutuhkan dan membaca kesiapanmu dari enam dimensi yang dijelaskan.'),
    },
    {
      icon: GraduationCap,
      step: '02',
      title: t('Learn what actually matters', 'Belajar yang benar-benar relevan'),
      body: t('Every class, course and project is linked to that goal — with gaps ranked by real job demand.', 'Setiap pelajaran, kursus, dan proyek terhubung ke tujuan itu — dengan gap yang diurutkan dari kebutuhan lowongan nyata.'),
    },
    {
      icon: Route,
      step: '03',
      title: t('Grow with a clear roadmap', 'Bertumbuh dengan roadmap yang jelas'),
      body: t('A step-by-step journey of quests, measurable progress, and one Next Best Action every day.', 'Journey bertahap berisi quest, progres terukur, dan satu Next Best Action setiap hari.'),
    },
  ];
  const audience = [
    { icon: School, label: t('SMA/SMK students', 'Siswa SMA/SMK') },
    { icon: GraduationCap, label: t('University students', 'Mahasiswa') },
    { icon: UserRound, label: t('Fresh graduates & job seekers', 'Fresh graduate & pencari kerja') },
    { icon: Building2, label: t('Schools & campuses', 'Sekolah & kampus') },
  ];

  return (
    <Section id="mission" className="overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-24 size-[620px] -translate-x-1/2 rounded-full bg-green/6 blur-3xl" aria-hidden />
      <div className="container-orbit relative">
        <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_1fr]">
          <SectionIntro
            eyebrow={t('Why Orbit exists', 'Tujuan Orbit')}
            title={
              <>
                {t('Every learner deserves to know why they learn —', 'Setiap pelajar berhak tahu untuk apa ia belajar —')} <span className="orbit-gradient-text">{t('and where it leads.', 'dan ke mana arahnya.')}</span>
              </>
            }
            desc={t(
              'Orbit started from one question: what if everything you learn — at school, on campus or on your own — pointed at the career you want? Orbit doesn’t replace teachers or lecturers. It connects what they teach to a clear destination, so every learner — not only those with the right network — can focus, learn smarter and arrive ready for work.',
              'Orbit berangkat dari satu pertanyaan: bagaimana jika semua yang kamu pelajari — di sekolah, di kampus, atau secara mandiri — mengarah ke karier yang kamu inginkan? Orbit tidak menggantikan guru atau dosen. Orbit menghubungkan apa yang mereka ajarkan ke tujuan yang jelas, sehingga setiap pelajar — bukan hanya yang punya koneksi — bisa fokus, belajar lebih cerdas, dan siap bekerja.',
            )}
          />
          <motion.ul variants={stagger(0.08)} {...reveal} className="flex flex-wrap gap-2 lg:justify-end" aria-label={t('Who Orbit is for', 'Orbit untuk siapa')}>
            {audience.map((a) => (
              <motion.li key={a.label} variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13.5px] font-semibold shadow-xs">
                <a.icon className="size-4 text-green" aria-hidden />
                {a.label}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.ol variants={stagger(0.12)} {...reveal} className="relative mt-12 grid gap-4 md:grid-cols-3">
          {/* Connecting line drawn behind the pillars on wide screens. */}
          <motion.span
            aria-hidden
            className="orbit-gradient absolute left-[16%] right-[16%] top-[52px] hidden h-[2px] origin-left rounded-full md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
          />
          {pillars.map((p) => (
            <motion.li key={p.step} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.25, ease }} className="card relative flex flex-col p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="relative flex size-14 items-center justify-center rounded-2xl bg-muted-green text-green-strong ring-[6px] ring-surface dark:text-green">
                  <p.icon className="size-6" aria-hidden />
                </span>
                <span className="font-display text-[34px] font-extrabold leading-none tracking-tight text-border-strong">{p.step}</span>
              </div>
              <h3 className="mt-5 font-display text-[19px] font-bold leading-snug tracking-tight">{p.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{p.body}</p>
            </motion.li>
          ))}
        </motion.ol>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.6, ease }}
          className="mt-6 flex flex-col gap-4 rounded-[24px] border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:p-6"
        >
          <Sdg4Mark size="lg" />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: SDG4_RED }}>
              {t('Sustainable Development Goal 4 · Quality Education', 'Tujuan Pembangunan Berkelanjutan 4 · Pendidikan Berkualitas')}
            </div>
            <p className="mt-1 text-[15.5px] font-semibold leading-snug">
              {t('Orbit is built for SDG 4 — inclusive, quality education where learning leads to relevant skills and decent work. It complements schools and campuses; it never replaces them.', 'Orbit dirancang untuk SDG 4 — pendidikan berkualitas dan inklusif di mana belajar menghasilkan skill relevan dan pekerjaan layak. Orbit melengkapi sekolah dan kampus, tidak pernah menggantikannya.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => scrollToId('sdg')}
            className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-[14px] font-semibold transition hover:border-border-strong hover:bg-surface-3"
          >
            {t('See our SDG 4 contribution', 'Lihat kontribusi SDG 4')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </motion.div>
      </div>
    </Section>
  );
}
