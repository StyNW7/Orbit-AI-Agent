import { AnimatePresence, motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { Tooltip } from '@/components/ui/overlays';
import { useResolvedTheme, useUi } from '@/store/ui';
import { useI18nStore, useT } from '@/lib/i18n';
import { centerOf, cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const resolved = useResolvedTheme();
  const setTheme = useUi((s) => s.setTheme);
  const { t } = useT();
  const next = resolved === 'dark' ? 'light' : 'dark';
  const label = next === 'dark' ? t('Switch to dark mode', 'Ganti ke mode gelap') : t('Switch to light mode', 'Ganti ke mode terang');
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={(e) => setTheme(next, centerOf(e.currentTarget))}
        aria-label={label}
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-muted-foreground transition hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
          className,
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolved}
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            {resolved === 'dark' ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </Tooltip>
  );
}

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const { t } = useT();
  return (
    <div role="radiogroup" aria-label={t('Language', 'Bahasa')} className={cn('relative inline-flex h-10 items-center rounded-xl border border-border bg-surface-2 p-1', className)}>
      {(['en', 'id'] as const).map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={l === 'en' ? 'English' : 'Bahasa Indonesia'}
            onClick={() => setLocale(l)}
            className={cn('relative h-8 w-9 rounded-[9px] text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]', active ? 'text-foreground' : 'text-subtle-foreground hover:text-foreground')}
          >
            {active && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-[9px] bg-surface shadow-[0_1px_3px_rgba(16,32,24,0.12)] dark:bg-surface-3" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
            <span className="relative z-10">{l.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
