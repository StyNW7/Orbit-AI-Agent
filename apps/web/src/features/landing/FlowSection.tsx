import { motion } from 'motion/react';
import { ArrowRight, GraduationCap, Repeat, Rocket, Route, TrendingUp, type LucideIcon } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease, fadeUp, reveal, stagger } from '@/lib/motion';
import { Section, SectionIntro } from './chrome';

interface Stage {
  icon: LucideIcon;
  verb: string;
  line: string;
  features: string[];
  tone: 'green' | 'orange' | 'dark' | 'soft';
}

/** The whole product as one loop — every feature belongs to exactly one verb. */
export function FlowSection() {
  const { t } = useT();
  const stages: Stage[] = [
    {
      icon: Rocket,
      verb: t('Dream', 'Impikan'),
      line: t('Pick the career you want — or several. Each dream gets its own orbit.', 'Pilih karier yang kamu inginkan — atau beberapa. Setiap impian punya orbit sendiri.'),
      features: [t('Dream orbits', 'Orbit impian'), t('Career goal', 'Tujuan karier'), 'Career Readiness'],
      tone: 'dark',
    },
    {
      icon: GraduationCap,
      verb: t('Learn', 'Belajar'),
      line: t('Bring your slides, notes and assignments. Orbit shows what each class is for and what to study next.', 'Bawa slide, catatan, dan tugasmu. Orbit menunjukkan kegunaan tiap kelas dan apa yang dipelajari berikutnya.'),
      features: ['Knowledge Vault', 'Learning Map', t('Learning Compass', 'Kompas Belajar')],
      tone: 'green',
    },
    {
      icon: Route,
      verb: t('Plan', 'Rencanakan'),
      line: t('Turn what to learn into a step-by-step roadmap of quests you can tick off.', 'Ubah yang perlu dipelajari menjadi roadmap bertahap berisi quest yang bisa dicentang.'),
      features: [t('Journey roadmap', 'Roadmap Journey'), t('Quests & Kanban', 'Quest & Kanban'), 'Career Universe'],
      tone: 'orange',
    },
    {
      icon: TrendingUp,
      verb: t('Grow', 'Tumbuh'),
      line: t('Do one Next Best Action a day, find the right opportunities and watch readiness rise.', 'Lakukan satu Next Best Action setiap hari, temukan peluang yang tepat, dan lihat kesiapanmu naik.'),
      features: ['Today', 'Discover', 'Orbit Agent', 'Progress'],
      tone: 'soft',
    },
  ];
  return (
    <Section id="flow" className="overflow-hidden bg-surface-2/40">
      <div className="container-orbit">
        <SectionIntro
          center
          eyebrow={t('One simple loop', 'Satu alur sederhana')}
          title={
            <>
              {t('Dream. Learn. Plan.', 'Impikan. Belajar. Rencanakan.')} <span className="orbit-gradient-text">{t('Grow.', 'Tumbuh.')}</span>
            </>
          }
          desc={t(
            'Orbit has a lot inside, but you only ever do four things — and every screen belongs to exactly one of them. No maze, no guessing where to go.',
            'Orbit punya banyak fitur, tetapi kamu hanya melakukan empat hal — dan setiap layar masuk ke salah satunya. Tidak membingungkan, tidak perlu menebak harus ke mana.',
          )}
        />
        <motion.ol variants={stagger(0.12)} {...reveal} className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.span
            aria-hidden
            className="orbit-gradient absolute left-[12%] right-[12%] top-[38px] hidden h-[2px] origin-left rounded-full lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 1.1, ease, delay: 0.3 }}
          />
          {stages.map((s, i) => (
            <motion.li key={s.verb} variants={fadeUp} className="relative">
              <div className="card flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'relative flex size-[52px] items-center justify-center rounded-2xl ring-[6px] ring-surface',
                      s.tone === 'dark' && 'bg-[#13201a] text-white dark:bg-[#e7efea] dark:text-[#13201a]',
                      s.tone === 'green' && 'orbit-gradient text-white shadow-green',
                      s.tone === 'orange' && 'bg-orange text-white shadow-orange',
                      s.tone === 'soft' && 'bg-muted-green text-green-strong dark:text-green',
                    )}
                  >
                    <s.icon className="size-6" aria-hidden />
                  </span>
                  <span className="font-display text-[34px] font-extrabold leading-none tracking-tight text-border-strong">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-[24px] font-extrabold tracking-tight">{s.verb}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{s.line}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                  {s.features.map((f) => (
                    <li key={f} className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[12px] font-semibold">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {i < stages.length - 1 && (
                <span className="absolute -bottom-3 left-1/2 z-10 flex size-7 -translate-x-1/2 rotate-90 items-center justify-center rounded-full border border-border bg-surface text-green shadow-xs sm:hidden" aria-hidden>
                  <ArrowRight className="size-3.5" />
                </span>
              )}
            </motion.li>
          ))}
        </motion.ol>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 text-center text-[14px] text-muted-foreground"
        >
          <Repeat className="size-4 shrink-0 text-green" aria-hidden />
          {t('…and repeat. Every material you add and every quest you finish moves your readiness.', '…lalu ulangi. Setiap materi yang kamu tambah dan quest yang kamu selesaikan menaikkan kesiapanmu.')}
        </motion.p>
      </div>
    </Section>
  );
}
