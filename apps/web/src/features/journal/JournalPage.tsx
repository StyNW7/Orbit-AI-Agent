import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Check, CircleCheck, Loader2, MoreHorizontal, NotebookPen, Pencil, Pin, PinOff, Plus, SearchX, Trash2 } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/shared/layout-blocks';
import { Card } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Field, Input, SearchInput, Textarea } from '@/components/ui/form';
import { FilterChips } from '@/components/ui/tabs';
import { Sheet, DropdownContent, DropdownItem, DropdownMenu, DropdownSeparator, DropdownTrigger } from '@/components/ui/overlays';
import { useOrbit } from '@/store/orbit';
import { addJournal } from '@/store/actions';
import type { JournalEntry, JournalTag } from '@/data/types';
import { useT, type Text } from '@/lib/i18n';
import { cn, formatDate, relative } from '@/lib/utils';
import { ease } from '@/lib/motion';

const TAGS: { id: JournalTag; label: Text; cls: string }[] = [
  { id: 'reflection', label: { en: 'Reflection', id: 'Refleksi' }, cls: 'bg-muted-green text-green-strong dark:text-green' },
  { id: 'interview', label: { en: 'Interview', id: 'Wawancara' }, cls: 'bg-muted-orange text-orange-strong dark:text-orange' },
  { id: 'learning', label: { en: 'Learning', id: 'Belajar' }, cls: 'bg-muted-info text-info' },
  { id: 'mentorship', label: { en: 'Mentorship', id: 'Mentoring' }, cls: 'bg-muted-violet text-violet' },
  { id: 'opportunity', label: { en: 'Opportunity', id: 'Peluang' }, cls: 'bg-muted-orange text-orange-strong dark:text-orange' },
  { id: 'decision', label: { en: 'Career decision', id: 'Keputusan karier' }, cls: 'bg-surface-2 text-foreground' },
];
const TAG = Object.fromEntries(TAGS.map((t) => [t.id, t])) as Record<JournalTag, (typeof TAGS)[number]>;
const MOODS = { great: '🚀', good: '🙂', okay: '😐', tough: '🌧️' } as const;

export default function JournalPage() {
  const journal = useOrbit((s) => s.journal);
  const update = useOrbit((s) => s.updateJournal);
  const remove = useOrbit((s) => s.deleteJournal);
  const restore = useOrbit((s) => s.restoreJournal);
  const { t, l } = useT();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<JournalTag | 'all'>('all');
  const [editing, setEditing] = useState<string | 'new' | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return journal
      .filter((j) => tag === 'all' || j.tags.includes(tag))
      .filter((j) => !q || `${j.title} ${j.body}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [journal, query, tag]);

  const del = (id: string) => {
    const e = remove(id);
    if (e) toast(t('Entry deleted', 'Catatan dihapus'), { description: e.title, action: { label: t('Undo', 'Urungkan'), onClick: () => restore(e) } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        stage={t('Grow', 'Tumbuh')}
        eyebrow={t('Career Journal', 'Career Journal')}
        title={t('Reflect, learn, decide', 'Refleksi, belajar, putuskan')}
        description={t('Capture interview notes, lessons and decisions. Reflection turns experience into growth.', 'Catat hasil wawancara, pelajaran, dan keputusan. Refleksi mengubah pengalaman menjadi pertumbuhan.')}
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus /> {t('New entry', 'Catatan baru')}
          </Button>
        }
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder={t('Search your journal…', 'Cari di journal…')} className="lg:w-80" count={list.length} />
        <FilterChips
          label={t('Filter by tag', 'Filter tag')}
          value={tag}
          onChange={setTag}
          className="lg:ml-2"
          options={[{ value: 'all' as const, label: t('All', 'Semua'), count: journal.length }, ...TAGS.map((x) => ({ value: x.id, label: l(x.label), count: journal.filter((j) => j.tags.includes(x.id)).length }))]}
        />
      </div>

      {journal.length === 0 ? (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title={t('Your journal is empty', 'Journal-mu masih kosong')}
            description={t('Write your first reflection — even three sentences help you see patterns over time.', 'Tulis refleksi pertamamu — tiga kalimat pun membantumu melihat pola dari waktu ke waktu.')}
            action={
              <Button onClick={() => setEditing('new')}>
                <Plus /> {t('Write first entry', 'Tulis catatan pertama')}
              </Button>
            }
          />
        </Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState compact icon={SearchX} title={t('No entries match', 'Tidak ada catatan yang cocok')} description={t('Try another word or tag.', 'Coba kata atau tag lain.')} />
        </Card>
      ) : (
        <motion.div layout className="columns-1 gap-4 md:columns-2 xl:columns-3 [&>*]:mb-4">
          <AnimatePresence mode="popLayout">
            {list.map((j, i) => (
              <motion.article
                key={j.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease, delay: Math.min(i * 0.04, 0.3) }}
                className={cn('card card-interactive group relative break-inside-avoid p-5', j.pinned && 'border-green/35 bg-gradient-to-b from-mint to-surface')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {j.pinned && (
                      <span className="inline-flex h-6 items-center gap-1 rounded-full bg-green px-2 text-[11.5px] font-bold text-white">
                        <Pin className="size-3" /> {t('Pinned', 'Disematkan')}
                      </span>
                    )}
                    {j.tags.map((tg) => (
                      <span key={tg} className={cn('inline-flex h-6 items-center rounded-full px-2 text-[11.5px] font-semibold', TAG[tg].cls)}>
                        {l(TAG[tg].label)}
                      </span>
                    ))}
                  </div>
                  <DropdownMenu>
                    <DropdownTrigger asChild>
                      <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-subtle-foreground transition hover:bg-surface-2 hover:text-foreground" aria-label={t('Entry actions', 'Aksi catatan')}>
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownTrigger>
                    <DropdownContent>
                      <DropdownItem onSelect={() => setEditing(j.id)}>
                        <Pencil /> {t('Edit', 'Ubah')}
                      </DropdownItem>
                      <DropdownItem onSelect={() => update(j.id, { pinned: !j.pinned })}>
                        {j.pinned ? <PinOff /> : <Pin />} {j.pinned ? t('Unpin', 'Lepas sematan') : t('Pin', 'Sematkan')}
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem danger onSelect={() => del(j.id)}>
                        <Trash2 /> {t('Delete', 'Hapus')}
                      </DropdownItem>
                    </DropdownContent>
                  </DropdownMenu>
                </div>
                <button type="button" onClick={() => setEditing(j.id)} className="mt-3 block w-full text-left">
                  <h3 className="font-display text-[17px] font-bold leading-snug tracking-tight">
                    {j.mood && <span className="mr-1.5" aria-hidden>{MOODS[j.mood]}</span>}
                    {j.title}
                  </h3>
                  <p className="mt-2 line-clamp-5 whitespace-pre-line text-[14px] leading-relaxed text-muted-foreground">{j.body}</p>
                  <div className="mt-4 text-[12px] text-subtle-foreground">
                    {formatDate(j.createdAt, 'd MMM yyyy')} · {t('edited {r}', 'diubah {r}', { r: relative(j.updatedAt) })}
                  </div>
                </button>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <JournalEditor id={editing} onClose={() => setEditing(null)} onCreated={(id) => setEditing(id)} />
    </div>
  );
}

function JournalEditor({ id, onClose, onCreated }: { id: string | 'new' | null; onClose: () => void; onCreated: (id: string) => void }) {
  const entry = useOrbit((s) => (id && id !== 'new' ? s.journal.find((j) => j.id === id) : undefined));
  const update = useOrbit((s) => s.updateJournal);
  const { t, l } = useT();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<JournalTag[]>([]);
  const [mood, setMood] = useState<JournalEntry['mood']>('good');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [err, setErr] = useState('');
  const loaded = useRef<string | null>(null);
  const isNew = id === 'new';

  useEffect(() => {
    if (!id) {
      loaded.current = null;
      return;
    }
    if (loaded.current === id) return;
    loaded.current = id;
    setTitle(entry?.title ?? '');
    setBody(entry?.body ?? '');
    setTags(entry?.tags ?? ['reflection']);
    setMood(entry?.mood ?? 'good');
    setStatus('idle');
    setErr('');
  }, [id, entry]);

  // Autosave existing entries.
  useEffect(() => {
    if (!entry || isNew || loaded.current !== entry.id) return;
    if (title === entry.title && body === entry.body && tags.join() === entry.tags.join() && mood === entry.mood) return;
    if (!title.trim()) return;
    setStatus('saving');
    const h = setTimeout(() => {
      update(entry.id, { title: title.trim(), body, tags, mood });
      setStatus('saved');
    }, 650);
    return () => clearTimeout(h);
  }, [title, body, tags, mood, entry, isNew, update]);

  const create = () => {
    if (!title.trim()) return setErr(t('Add a short title', 'Tambahkan judul singkat'));
    const e = addJournal({ title: title.trim(), body, tags, mood });
    toast.success(t('Journal entry saved', 'Catatan disimpan'), { description: `+15 XP` });
    loaded.current = e.id;
    onCreated(e.id);
    setStatus('saved');
  };

  const toggleTag = (tg: JournalTag) => setTags((cur) => (cur.includes(tg) ? cur.filter((x) => x !== tg) : [...cur, tg]));

  return (
    <Sheet
      open={Boolean(id)}
      onOpenChange={(o) => !o && onClose()}
      title={isNew ? t('New journal entry', 'Catatan journal baru') : t('Edit entry', 'Ubah catatan')}
      description={isNew ? t('Write freely — you can edit anytime.', 'Tulis dengan bebas — bisa diubah kapan saja.') : undefined}
      width={560}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground" aria-live="polite">
            {status === 'saving' && (
              <>
                <Loader2 className="size-3.5 animate-spin" /> {t('Saving…', 'Menyimpan…')}
              </>
            )}
            {status === 'saved' && (
              <>
                <CircleCheck className="size-3.5 text-green" /> {t('All changes saved', 'Semua perubahan tersimpan')}
              </>
            )}
            {status === 'idle' && !isNew && (
              <>
                <Check className="size-3.5 text-green" /> {t('Autosave on', 'Autosave aktif')}
              </>
            )}
          </span>
          {isNew ? (
            <Button onClick={create}>
              <Check /> {t('Save entry', 'Simpan catatan')}
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              {t('Done', 'Selesai')}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <Field label={t('Title', 'Judul')} htmlFor="j-title" error={err}>
          <Input id="j-title" value={title} aria-invalid={Boolean(err)} onChange={(e) => { setTitle(e.target.value); setErr(''); }} placeholder={t('e.g. What I learned from today’s interview', 'mis. Pelajaran dari wawancara hari ini')} />
        </Field>
        <Field label={t('Notes', 'Catatan')} htmlFor="j-body">
          <Textarea id="j-body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[220px]" placeholder={t('What happened? What did you learn? What will you do next?', 'Apa yang terjadi? Apa yang kamu pelajari? Apa yang akan kamu lakukan selanjutnya?')} />
        </Field>
        <div>
          <div className="mb-2 text-[13px] font-semibold">{t('Tags', 'Tag')}</div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((x) => {
              const on = tags.includes(x.id);
              return (
                <button key={x.id} type="button" aria-pressed={on} onClick={() => toggleTag(x.id)} className={cn('inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[12.5px] font-semibold transition', on ? `border-transparent ${x.cls}` : 'border-border text-muted-foreground hover:border-border-strong')}>
                  {on && <Check className="size-3" />}
                  {l(x.label)}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[13px] font-semibold">{t('How did it feel?', 'Bagaimana rasanya?')}</div>
          <div role="radiogroup" aria-label={t('Mood', 'Suasana hati')} className="flex gap-2">
            {(Object.keys(MOODS) as (keyof typeof MOODS)[]).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={mood === m} aria-label={m} onClick={() => setMood(m)} className={cn('flex size-11 items-center justify-center rounded-xl border text-[20px] transition', mood === m ? 'scale-105 border-green bg-muted-green' : 'border-border hover:border-border-strong')}>
                {MOODS[m]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
