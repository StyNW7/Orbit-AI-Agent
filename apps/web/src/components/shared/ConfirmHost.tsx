import { useState } from 'react';
import { motion } from 'motion/react';
import { BellRing, Route, RotateCcw, Send, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/overlays';
import { Button } from '@/components/ui/button';
import { ImpactPill } from './layout-blocks';
import { useUi } from '@/store/ui';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const ICONS = { journey: Route, reminder: BellRing, reset: RotateCcw, delete: Trash2, apply: Send };

/** Human-in-the-loop: Orbit never changes career data without an explicit confirmation. */
export function ConfirmHost() {
  const req = useUi((s) => s.confirm);
  const close = useUi((s) => s.closeConfirm);
  const [busy, setBusy] = useState(false);
  const { t } = useT();
  const Icon = req?.icon ? ICONS[req.icon] : Sparkles;
  const danger = req?.tone === 'danger';

  const confirm = async () => {
    if (!req) return;
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 380));
      await req.onConfirm();
    } finally {
      setBusy(false);
      close();
    }
  };

  return (
    <Modal open={Boolean(req)} onOpenChange={(o) => !o && !busy && close()} title={req?.title ?? ''} hideTitle size="sm">
      {req && (
        <div>
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.05 }}
              className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', danger ? 'bg-muted-danger text-danger' : 'bg-muted-green text-green-strong dark:text-green')}
            >
              <Icon className="size-[22px]" aria-hidden />
            </motion.div>
            <div className="min-w-0 pt-0.5">
              <h2 className="font-display text-[19px] font-bold leading-snug tracking-tight">{req.title}</h2>
              {req.description && <p className="mt-1 text-[14px] text-muted-foreground">{req.description}</p>}
            </div>
          </div>

          {req.items && req.items.length > 0 && (
            <div className="mt-5 rounded-2xl border border-border bg-surface-2/60 p-1.5">
              {req.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3.5 py-3 shadow-xs">
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-semibold uppercase tracking-wider text-subtle-foreground">{danger ? t('Remove', 'Hapus') : t('Add', 'Tambah')}</div>
                    <div className="truncate text-[14.5px] font-semibold">{it.label}</div>
                    {it.meta && <div className="truncate text-[12.5px] text-muted-foreground">{it.meta}</div>}
                  </div>
                  {req.impact !== undefined && i === 0 && <ImpactPill value={req.impact} />}
                </div>
              ))}
            </div>
          )}

          {req.impact !== undefined && (
            <p className="mt-3 text-[13px] text-muted-foreground">
              {t('Expected impact', 'Perkiraan dampak')}: <strong className="text-foreground">+{req.impact}% {t('career readiness', 'career readiness')}</strong>
            </p>
          )}
          {req.extra}

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-green" aria-hidden />
            {t('Orbit only changes your plan after you confirm.', 'Orbit hanya mengubah rencanamu setelah kamu konfirmasi.')}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={close} disabled={busy}>
              {req.cancelLabel ?? t('Cancel', 'Batal')}
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} onClick={confirm} loading={busy} autoFocus>
              {req.confirmLabel ?? t('Confirm & Add', 'Konfirmasi & Tambah')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
