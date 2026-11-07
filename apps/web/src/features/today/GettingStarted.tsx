import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowRight, Check, GraduationCap, Library, PartyPopper, Rocket, Route, Sparkles, X, type LucideIcon } from 'lucide-react';
import { ProgressBar } from '@/components/ui/primitives';
import { Tooltip } from '@/components/ui/overlays';
import { useUi } from '@/store/ui';
import { useGuide } from '@/store/guide';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';

interface Step {
  id: string;
  stage: string;
  icon: LucideIcon;
  title: string;
  body: string;
  done: boolean;
  go: () => void;
}

/** First-run checklist that walks a learner through Orbit's single loop: Dream → Learn → Plan → Grow. */
export function GettingStarted() {
  const seen = useGuide((s) => s.seen);
  const dismissed = useGuide((s) => s.dismissed);
  const setDismissed = useGuide((s) => s.setDismissed);
  const openAgent = useUi((s) => s.openAgent);
  const setOrbitsOpen = useUi((s) => s.setOrbitsOpen);
  const openAddMaterial = useUi((s) => s.openAddMaterial);
  const navigate = useNavigate();
  const { t } = useT();

  const steps: Step[] = [
    {
      id: 'orbit',
      stage: t('Dream', 'Impian'),
      icon: Rocket,
      title: t('Check your dream orbit', 'Cek orbit impianmu'),
      body: t('One orbit per career dream — switch or add one from the top bar.', 'Satu orbit untuk tiap impian karier — ganti atau tambah dari bar atas.'),
      done: Boolean(seen.orbit),
      go: () => setOrbitsOpen(true),
    },
    {
      id: 'vault',
      stage: t('Learn', 'Belajar'),
      icon: Library,
      title: t('Add a learning material', 'Tambah satu materi'),
      body: t('Slides, notes or an assignment — Orbit finds the skills inside.', 'Slide, catatan, atau tugas — Orbit menemukan skill di dalamnya.'),
      done: Boolean(seen.vault),
      go: () => openAddMaterial(),
    },
    {
      id: 'learning',
      stage: t('Learn', 'Belajar'),
      icon: GraduationCap,
      title: t('See what your classes are for', 'Lihat kegunaan mata kuliahmu'),
      body: t('Every class, mapped to the career it powers.', 'Setiap mata kuliah, dipetakan ke karier yang didukungnya.'),
      done: Boolean(seen.learning),
      go: () => navigate('/app/learning?view=map'),
    },
    {
      id: 'journey',
      stage: t('Plan', 'Rencana'),
      icon: Route,
      title: t('Plan your Journey', 'Rencanakan Journey-mu'),
      body: t('Turn what to learn into quests you can tick off.', 'Ubah yang perlu dipelajari jadi quest yang bisa dicentang.'),
      done: Boolean(seen.journey),
      go: () => navigate('/app/journey'),
    },
    {
      id: 'agent',
      stage: t('Grow', 'Tumbuh'),
      icon: Sparkles,
      title: t('Ask Orbit Agent', 'Tanya Orbit Agent'),
      body: t('Get an explained answer to “what next?”.', 'Dapatkan jawaban “langkah berikutnya?” beserta alasannya.'),
      done: Boolean(seen.agent),
      go: () => openAgent({ text: t('What should I do next?', 'Apa yang harus saya lakukan selanjutnya?') }),
    },
  ];
  const done = steps.filter((s) => s.done).length;
  const complete = done === steps.length;
  const next = steps.find((s) => !s.done);

  const hide = () => {
    setDismissed(true);
    toast(t('Guide hidden', 'Panduan disembunyikan'), {
      description: t('Open it again anytime from the account menu.', 'Buka lagi kapan saja dari menu akun.'),
      action: { label: t('Undo', 'Urungkan'), onClick: () => setDismissed(false) },
    });
  };

  return (
    <AnimatePresence initial={false}>
      {!dismissed && (
        <motion.section
          key="guide"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease }}
          aria-labelledby="guide-title"
          className="overflow-hidden"
        >
          <div className="card relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-green/10 blur-3xl" aria-hidden />
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="eyebrow text-green-strong dark:text-green">{complete ? t('All set', 'Semua siap') : t('Start here', 'Mulai di sini')}</div>
                <h2 id="guide-title" className="mt-1 font-display text-[19px] font-bold tracking-tight">
                  {complete ? t('You know your way around Orbit.', 'Kamu sudah menguasai dasar-dasar Orbit.') : t('Your Orbit flow: Dream → Learn → Plan → Grow', 'Alur Orbit-mu: Impian → Belajar → Rencana → Tumbuh')}
                </h2>
                <p className="mt-0.5 text-[13.5px] text-muted-foreground">
                  {complete
                    ? t('Come back to Today each day — your Next Best Action updates as you grow.', 'Kembali ke Hari Ini setiap hari — Next Best Action-mu ikut berubah seiring pertumbuhanmu.')
                    : t('{d} of {n} done · each step takes under a minute.', '{d} dari {n} selesai · tiap langkah kurang dari satu menit.', { d: done, n: steps.length })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {next && (
                  <motion.button
                    type="button"
                    onClick={next.go}
                    whileTap={{ scale: 0.97 }}
                    className="hidden h-9 items-center gap-1.5 rounded-xl bg-green px-3.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(10,180,106,0.85)] transition hover:bg-green-strong sm:inline-flex"
                  >
                    {t('Next step', 'Langkah berikutnya')} <ArrowRight className="size-4" />
                  </motion.button>
                )}
                <Tooltip content={t('Hide guide', 'Sembunyikan panduan')}>
                  <button type="button" onClick={hide} aria-label={t('Hide guide', 'Sembunyikan panduan')} className="flex size-9 items-center justify-center rounded-xl text-subtle-foreground transition hover:bg-surface-2 hover:text-foreground">
                    <X className="size-4" />
                  </button>
                </Tooltip>
              </div>
            </div>
            <ProgressBar value={(done / steps.length) * 100} size="sm" tone="gradient" className="relative mt-4" label={t('Guide progress', 'Progres panduan')} />

            {complete ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }} className="relative mt-4 flex items-center gap-3 rounded-2xl bg-muted-green p-4">
                <PartyPopper className="size-6 shrink-0 text-green-strong dark:text-green" />
                <p className="flex-1 text-[14px] font-medium">{t('Great work! You have explored every part of your Orbit.', 'Kerja bagus! Kamu sudah menjelajahi semua bagian Orbit-mu.')}</p>
                <button type="button" onClick={() => setDismissed(true)} className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-green-strong transition hover:bg-green/10 dark:text-green">
                  {t('Close', 'Tutup')}
                </button>
              </motion.div>
            ) : (
              <ol className="relative mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {steps.map((s, i) => {
                  const isNext = s.id === next?.id;
                  return (
                    <li key={s.id} className={cn(i === steps.length - 1 && 'sm:col-span-2 lg:col-span-1')}>
                      <button
                        type="button"
                        onClick={s.go}
                        className={cn(
                          'group flex h-full w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5',
                          s.done ? 'border-green/25 bg-muted-green/50' : isNext ? 'border-orange/40 bg-surface shadow-card hover:shadow-hover' : 'border-border bg-surface hover:border-border-strong hover:shadow-card',
                        )}
                      >
                        <span
                          className={cn(
                            'relative flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-colors',
                            s.done ? 'bg-green text-white' : isNext ? 'bg-orange text-white' : 'bg-surface-2 text-muted-foreground',
                          )}
                        >
                          {isNext && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-orange/40" aria-hidden />}
                          {s.done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="mb-0.5 block text-[10.5px] font-bold uppercase tracking-[0.12em] text-subtle-foreground">{s.stage}</span>
                          <span className={cn('flex items-center gap-1.5 text-[13.5px] font-semibold leading-snug', s.done && 'text-muted-foreground')}>
                            <s.icon className="size-3.5 shrink-0 text-green" aria-hidden />
                            {s.title}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{s.body}</span>
                          {s.done && <span className="sr-only">{t('Completed', 'Selesai')}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
