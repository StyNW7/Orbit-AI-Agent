import { useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { OrbitMark } from '@/components/brand/brand';
import { useStoryReturn } from '@/store/story';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';

/** Floating “back to the story” pill shown after jumping from Why Orbit into a live feature. */
export function ReturnToStory({ className }: { className?: string }) {
  const ret = useStoryReturn((s) => s.ret);
  const clear = useStoryReturn((s) => s.clear);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, l } = useT();
  const show = Boolean(ret) && location.pathname !== ret?.path;

  return (
    <AnimatePresence>
      {show && ret && (
        <div className={cn('pointer-events-none fixed inset-x-0 top-[84px] z-40 flex justify-center px-4 lg:bottom-7 lg:top-auto', className)}>
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.35, ease }}
            className="pointer-events-auto flex max-w-full items-center gap-1 rounded-full bg-[#13201a] p-1 text-white shadow-[0_18px_44px_-14px_rgba(10,30,20,0.7)] ring-1 ring-white/10 dark:bg-[#e7efea] dark:text-[#13201a] dark:ring-black/5"
          >
            <button
              type="button"
              onClick={() => navigate(ret.path)}
              className="group flex min-w-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 text-left transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] dark:hover:bg-black/5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 dark:bg-black/5">
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              </span>
              <OrbitMark plate className="hidden size-7 shrink-0 sm:inline-flex" />
              <span className="min-w-0 truncate text-[13.5px] font-semibold">
                {t('Back to Why Orbit', 'Kembali ke Why Orbit')}
                <span className="hidden font-medium opacity-60 sm:inline"> · {l(ret.label)}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={clear}
              aria-label={t('Dismiss', 'Tutup')}
              className="flex size-8 shrink-0 items-center justify-center rounded-full opacity-60 transition hover:bg-white/10 hover:opacity-100 dark:hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
