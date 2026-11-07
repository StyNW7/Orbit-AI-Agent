import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowRightLeft, BookOpen, Compass, GraduationCap, Hammer, MessageCircleQuestion, School, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLES, SKILL_BY_ID } from '@/data/catalog';
import { BAND_LABEL, COURSE_BY_ID, COURSE_LEVEL_LABEL, careersFor, coursesFor, relevanceBand, type Course } from '@/data/courses';
import type { RoleId } from '@/data/types';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';
import { Section } from './chrome';

type Mode = 'class' | 'career';
type Level = 'campus' | 'school';

const CAMPUS_PICKS = ['statistics', 'database', 'web-prog', 'hci', 'system-analysis', 'biz-comm', 'marketing-mgmt', 'digital-marketing', 'data-mining', 'accounting', 'research-methods', 'org'];
const SCHOOL_PICKS = ['sch-math', 'sch-informatics', 'sch-economics', 'sch-language', 'sch-art', 'smk-rpl'];

/** Role colours that stay visible on the dark compass panel. */
const onDark = (c: string) => (c.toLowerCase() === '#13201a' ? '#e7efea' : c);

const ROW = 52;
const GAP = 10;

function Beams({ scores }: { scores: number[] }) {
  const h = scores.length * ROW + (scores.length - 1) * GAP;
  return (
    <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="hidden h-full w-full sm:block" style={{ height: h }} aria-hidden>
      <defs>
        <linearGradient id="beam" x1="0" x2="1">
          <stop offset="0" stopColor="#0AB46A" />
          <stop offset="1" stopColor="#FB9002" />
        </linearGradient>
      </defs>
      {scores.map((s, i) => {
        const y = i * (ROW + GAP) + ROW / 2;
        const d = `M0 ${h / 2} C 55 ${h / 2}, 45 ${y}, 100 ${y}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <motion.path
              d={d}
              fill="none"
              stroke="url(#beam)"
              strokeLinecap="round"
              strokeWidth={1 + (s / 100) * 6}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: s < 15 ? 0.25 : 0.35 + s / 160 }}
              transition={{ duration: 0.8, ease, delay: 0.08 * i }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function ClassToCareer({ course }: { course: Course }) {
  const { t, l } = useT();
  const careers = careersFor(course);
  const isSchool = course.level === 'school';
  return (
    <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease }}>
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,200px)_minmax(40px,1fr)_minmax(0,1.6fr)]">
        <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4ee39a]">
            {isSchool ? <School className="size-3.5" /> : <GraduationCap className="size-3.5" />}
            {l(COURSE_LEVEL_LABEL[course.level])}
          </div>
          <div className="mt-1.5 font-display text-[19px] font-bold leading-snug text-white">{l(course.name)}</div>
          {!isSchool && course.semester > 0 && (
            <div className="mt-1 text-[12.5px] text-white/55">
              {t('Usually semester {n}', 'Biasanya semester {n}', { n: course.semester })}
              {course.credits > 0 && ` · ${course.credits} ${t('credits', 'SKS')}`}
            </div>
          )}
        </div>
        <Beams scores={careers.map((c) => c.score)} />
        <ul className="space-y-2.5" aria-label={t('Careers this class powers', 'Karier yang didukung kelas ini')}>
          {careers.map(({ role, score }, i) => {
            const band = relevanceBand(score);
            return (
              <li key={role.id} className="flex h-[52px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: onDark(role.color) }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-white">{l(role.name)}</span>
                    <span className={cn('tabular shrink-0 text-[13px] font-bold', band === 'core' ? 'text-[#4ee39a]' : band === 'indirect' ? 'text-white/40' : 'text-white')}>{score}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-[#0AB46A] to-[#FB9002]" initial={{ width: 0 }} animate={{ width: `${Math.max(score, 2)}%` }} transition={{ duration: 0.8, ease, delay: 0.06 * i }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-white/50">{t('Builds', 'Membangun')}</span>
        {course.skills.map((s) => (
          <span key={s.skill} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[12.5px] font-semibold text-white/85">
            <span className="flex gap-0.5" aria-hidden>
              {[1, 2, 3].map((k) => (
                <span key={k} className={cn('size-1 rounded-full', k <= s.weight ? 'bg-[#4ee39a]' : 'bg-white/20')} />
              ))}
            </span>
            {l(SKILL_BY_ID[s.skill].name)}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#4ee39a]">
            <Target className="size-3.5" /> {t('Why it matters', 'Kenapa penting')}
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-white/80">{l(course.why)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-orange">
            <Hammer className="size-3.5" /> {t('Turn it into evidence', 'Jadikan bukti nyata')}
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-white/80">{l(course.project)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-white/70">
            <MessageCircleQuestion className="size-3.5" /> {isSchool ? t('Ask your teacher', 'Tanyakan ke guru') : t('Ask your lecturer', 'Tanyakan ke dosen')}
          </div>
          <p className="mt-2 text-[14px] italic leading-relaxed text-white/80">“{l(course.ask)}”</p>
        </div>
      </div>
    </motion.div>
  );
}

function CareerToClass({ roleId }: { roleId: RoleId }) {
  const { t, l } = useT();
  const ranked = useMemo(() => coursesFor(roleId).slice(0, 6), [roleId]);
  return (
    <motion.div key={roleId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease }}>
      <ol className="space-y-2.5">
        {ranked.map(({ course, score }, i) => {
          const band = relevanceBand(score);
          return (
            <li key={course.id} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[28px_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:p-3.5">
              <span className="tabular flex size-7 items-center justify-center rounded-lg bg-white/10 text-[12px] font-bold text-white">{i + 1}</span>
              <div className="min-w-0">
                <div className="truncate text-[14.5px] font-semibold text-white">{l(course.name)}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-white/50">
                  <span>{l(COURSE_LEVEL_LABEL[course.level])}</span>
                  <span aria-hidden>·</span>
                  <span className={cn(band === 'core' ? 'text-[#4ee39a]' : 'text-white/60')}>{l(BAND_LABEL[band])}</span>
                </div>
              </div>
              <div className="col-span-3 h-1.5 overflow-hidden rounded-full bg-white/10 sm:col-span-1">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#0AB46A] to-[#FB9002]" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease, delay: 0.05 * i }} />
              </div>
              <span className="tabular row-start-1 text-right text-[14px] font-bold text-white sm:row-start-auto">{score}%</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-white/55">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-orange" />
        {t(
          'Your teachers and lecturers still teach every one of these. Orbit simply shows which ones deserve extra depth for the career you are aiming at.',
          'Guru dan dosenmu tetap mengajar semuanya. Orbit hanya menunjukkan pelajaran mana yang layak kamu dalami lebih jauh untuk karier yang kamu tuju.',
        )}
      </p>
    </motion.div>
  );
}

export function CompassSection() {
  const { t, l } = useT();
  const orbitMode = useOrbit((s) => s.mode);
  const [mode, setMode] = useState<Mode>('class');
  const [level, setLevel] = useState<Level>('campus');
  const [courseId, setCourseId] = useState('statistics');
  const [roleId, setRoleId] = useState<RoleId>('product-manager');
  const picks = (level === 'campus' ? CAMPUS_PICKS : SCHOOL_PICKS).map((id) => COURSE_BY_ID[id]);
  const course = COURSE_BY_ID[courseId];

  const pickLevel = (lv: Level) => {
    setLevel(lv);
    setCourseId(lv === 'campus' ? CAMPUS_PICKS[0] : SCHOOL_PICKS[0]);
  };

  const chip = (on: boolean) =>
    cn(
      'inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-left text-[13px] font-semibold transition-[background-color,color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4ee39a]/40',
      on ? 'border-transparent bg-white text-[#0d1813]' : 'border-white/12 bg-white/[0.05] text-white/75 hover:border-white/25 hover:text-white',
    );

  return (
    <Section id="compass" className="overflow-hidden">
      <div className="container-orbit">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.7, ease }}
          className="relative overflow-hidden rounded-[32px] bg-[#0d1813] px-5 py-10 text-white shadow-pop sm:px-10 sm:py-14 lg:px-14"
        >
          <div className="pointer-events-none absolute -left-24 -top-24 size-[380px] rounded-full bg-green/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-32 -right-24 size-[380px] rounded-full bg-orange/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />

          <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#4ee39a]">
                <Compass className="size-3.5" /> {t('Learning Compass', 'Kompas Belajar')}
              </div>
              <h2 className="mt-4 font-display text-[32px] font-extrabold leading-[1.06] tracking-[-0.035em] text-white sm:text-[44px] lg:text-[50px]">
                {t('“When will I ever use this?”', '“Pelajaran ini buat apa, sih?”')} <span className="bg-gradient-to-r from-[#4ee39a] to-orange bg-clip-text text-transparent">{t('Answered.', 'Terjawab.')}</span>
              </h2>
            </div>
            <p className="text-[16px] leading-relaxed text-white/65 sm:text-[17px]">
              {t(
                'Pick a class you take at school or on campus — Orbit shows the careers it powers, the skills it builds and how to turn it into real evidence. Or flip it: choose a career and see which classes matter most.',
                'Pilih pelajaran yang kamu ambil di sekolah atau kampus — Orbit menunjukkan karier yang didukungnya, skill yang dibangunnya, dan cara menjadikannya bukti nyata. Atau sebaliknya: pilih karier dan lihat pelajaran mana yang paling penting.',
              )}
            </p>
          </div>

          <div className="relative mt-8 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-white/12 bg-white/[0.05] p-1" role="group" aria-label={t('Compass direction', 'Arah kompas')}>
              {(
                [
                  ['class', t('Class → Career', 'Pelajaran → Karier'), BookOpen],
                  ['career', t('Career → Class', 'Karier → Pelajaran'), Target],
                ] as const
              ).map(([m, label, Icon]) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={cn('relative inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] sm:px-3.5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4ee39a]/40', mode === m ? 'text-[#0d1813]' : 'text-white/70 hover:text-white')}
                >
                  {mode === m && <motion.span layoutId="compass-mode" className="absolute inset-0 rounded-full bg-[#4ee39a]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <Icon className="relative hidden size-4 min-[400px]:block" aria-hidden />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
            <ArrowRightLeft className="hidden size-4 text-white/30 sm:block" aria-hidden />
            {mode === 'class' && (
              <div className="inline-flex rounded-full border border-white/12 bg-white/[0.05] p-1" role="group" aria-label={t('Where you learn it', 'Tempat kamu mempelajarinya')}>
                {(
                  [
                    ['campus', t('Campus', 'Kampus')],
                    ['school', t('School (SMA/SMK)', 'Sekolah (SMA/SMK)')],
                  ] as const
                ).map(([lv, label]) => (
                  <button
                    key={lv}
                    type="button"
                    aria-pressed={level === lv}
                    onClick={() => pickLevel(lv)}
                    className={cn('h-9 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold sm:px-3.5 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4ee39a]/40', level === lv ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-10">
            <div className="min-w-0">
              <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-white/45">{mode === 'class' ? t('Pick a class', 'Pilih pelajaran') : t('Pick a career', 'Pilih karier')}</div>
              {mode === 'class' ? (
                <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-10 sm:px-10 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
                  {picks.map((c) => (
                    <button key={c.id} type="button" aria-pressed={courseId === c.id} onClick={() => setCourseId(c.id)} className={chip(courseId === c.id)}>
                      {l(c.name)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-10 sm:px-10 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 lg:flex-col lg:items-start">
                  {ROLES.map((r) => (
                    <button key={r.id} type="button" aria-pressed={roleId === r.id} onClick={() => setRoleId(r.id)} className={chip(roleId === r.id)}>
                      <span className="size-2 rounded-full" style={{ background: roleId === r.id && r.color.toLowerCase() === '#13201a' ? r.color : onDark(r.color) }} aria-hidden />
                      {l(r.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {mode === 'class' ? <ClassToCareer key={`c-${course.id}`} course={course} /> : <CareerToClass key={`r-${roleId}`} roleId={roleId} />}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-[13.5px] text-white/55">
              {t('Inside Orbit, the Learning Map does this for your whole curriculum — semester by semester, against your own skill levels.', 'Di dalam Orbit, Learning Map melakukan ini untuk seluruh kurikulummu — per semester, dibandingkan dengan level skill-mu sendiri.')}
            </p>
            <Button asChild size="lg" className="shrink-0">
              <Link to={orbitMode === 'none' ? '/start?demo=1' : '/app/learning?view=map'}>
                {t('Open my Learning Map', 'Buka Learning Map saya')} <ArrowRight />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
