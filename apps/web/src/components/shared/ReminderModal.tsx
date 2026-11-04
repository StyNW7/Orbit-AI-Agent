import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/overlays';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { cn, daysFromNow, friendlyDate } from '@/lib/utils';

export interface ReminderTarget {
  title: string;
  oppId?: string;
  questId?: string;
  suggestedDate?: string;
}

/** Create a reminder for an opportunity or quest. */
export function ReminderModal({ target, onClose }: { target: ReminderTarget | null; onClose: () => void }) {
  const addReminder = useOrbit((s) => s.addReminder);
  const { t } = useT();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(daysFromNow(1));
  const [time, setTime] = useState('09:00');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!target) return;
    setTitle(target.title);
    setDate(target.suggestedDate ?? daysFromNow(1));
    setTime('09:00');
    setErr('');
  }, [target]);

  const presets = [
    { label: t('Tomorrow', 'Besok'), v: daysFromNow(1) },
    { label: t('In 3 days', '3 hari lagi'), v: daysFromNow(3) },
    { label: t('Next week', 'Minggu depan'), v: daysFromNow(7) },
    ...(target?.suggestedDate ? [{ label: t('Before deadline', 'Sebelum deadline'), v: target.suggestedDate }] : []),
  ];

  const save = () => {
    if (!title.trim()) return setErr(t('Give your reminder a title', 'Beri judul pengingat'));
    if (!date || date < daysFromNow(0)) return setErr(t('Choose today or a future date', 'Pilih hari ini atau tanggal mendatang'));
    addReminder({ title: title.trim(), date, time, oppId: target?.oppId, questId: target?.questId });
    toast.success(t('Reminder created', 'Pengingat dibuat'), { description: `${friendlyDate(date)} · ${time}`, icon: <BellRing className="size-4 text-green" /> });
    onClose();
  };

  return (
    <Modal open={Boolean(target)} onOpenChange={(o) => !o && onClose()} title={t('Create reminder', 'Buat pengingat')} description={t('Orbit will nudge you at the right time.', 'Orbit akan mengingatkanmu di waktu yang tepat.')} size="sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-4"
      >
        <Field label={t('Title', 'Judul')} htmlFor="rem-title" error={err && !title.trim() ? err : undefined}>
          <Input id="rem-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <div>
          <div className="mb-1.5 text-[13px] font-semibold">{t('When', 'Kapan')}</div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setDate(p.v)}
                className={cn('h-9 rounded-full border px-3.5 text-[13px] font-semibold transition', date === p.v ? 'border-green bg-muted-green text-green-strong dark:text-green' : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground')}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('Date', 'Tanggal')} htmlFor="rem-date" error={err && title.trim() ? err : undefined}>
            <Input id="rem-date" type="date" value={date} min={daysFromNow(0)} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label={t('Time', 'Waktu')} htmlFor="rem-time">
            <Input id="rem-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            {t('Cancel', 'Batal')}
          </Button>
          <Button type="submit">
            <BellRing /> {t('Create reminder', 'Buat pengingat')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
