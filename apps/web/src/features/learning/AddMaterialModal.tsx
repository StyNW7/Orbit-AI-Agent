import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, Check, FileUp, Link2, Loader2, Lock, Sparkles, Wand2, X } from 'lucide-react';
import { Modal } from '@/components/ui/overlays';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { Segmented } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/primitives';
import { SKILL_BY_ID, ROLE_BY_ID } from '@/data/catalog';
import { COURSE_BY_ID, curriculumFor } from '@/data/courses';
import type { Material, MaterialKind } from '@/data/types';
import { ACCEPT, KIND_LABEL, MAX_FILE_MB, analyzeMaterial, extOf, extractText, materialRelevance, sampleMaterial, type Analysis, type Extracted } from '@/engine/knowledge';
import { useOrbit } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { syncAchievements } from '@/store/actions';
import { useT } from '@/lib/i18n';
import { cn, uid } from '@/lib/utils';
import { ease } from '@/lib/motion';

function guessKind(name: string): MaterialKind {
  const n = name.toLowerCase();
  if (/tugas|assignment|homework|quiz|kuis|\buts\b|\buas\b|latihan|exercise/.test(n)) return 'assignment';
  if (/project|proyek|prd|case study|studi kasus|report|laporan|portfolio|portofolio|capstone|skripsi/.test(n)) return 'project';
  const ext = extOf(n);
  if (['pptx', 'key', 'ppt'].includes(ext)) return 'slides';
  if (['ipynb', 'sql', 'py', 'js', 'ts', 'r'].includes(ext)) return 'assignment';
  return 'notes';
}

const prettyTitle = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
const mb = (b: number) => `${(b / 1_048_576).toFixed(b < 1_048_576 ? 2 : 1)} MB`;

type Step = 'input' | 'analyzing' | 'review';

const PHASES = [
  { en: 'Reading your material', id: 'Membaca materimu' },
  { en: 'Extracting the text', id: 'Mengekstrak teks' },
  { en: 'Detecting skills & key terms', id: 'Mendeteksi skill & istilah kunci' },
  { en: 'Linking it to your class and orbit', id: 'Menghubungkan ke kelas dan orbit-mu' },
];

export function AddMaterialModal() {
  const state = useUi((s) => s.addMaterial);
  const close = useUi((s) => s.closeAddMaterial);
  const profile = useOrbit((s) => s.profile);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, l, locale } = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [sample, setSample] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<MaterialKind>('notes');
  const [courseId, setCourseId] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState<{ analysis: Analysis; extracted: Extracted } | null>(null);

  useEffect(() => {
    if (!state.open) return;
    setMode('file');
    setFile(null);
    setSample(false);
    setUrl('');
    setTitle('');
    setKind('notes');
    setCourseId(state.courseId ?? '');
    setNote('');
    setErr({});
    setStep('input');
    setPhase(0);
    setResult(null);
  }, [state.open, state.courseId]);

  const curriculum = useMemo(() => (profile ? curriculumFor(profile.major) : []), [profile]);
  if (!profile) return null;

  const pickFile = (f: File | undefined, isSample = false) => {
    if (!f) return;
    if (f.size > MAX_FILE_MB * 1_048_576) {
      setErr({ file: t('That file is larger than {n} MB.', 'File lebih besar dari {n} MB.', { n: MAX_FILE_MB }) });
      return;
    }
    setFile(f);
    setSample(isSample);
    setErr({});
    setTitle(prettyTitle(f.name));
    setKind(guessKind(f.name));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'file' && !file) e.file = t('Choose a file or try the sample.', 'Pilih file atau coba contoh.');
    if (mode === 'link') {
      try {
        const u = new URL(url.trim());
        if (!/^https?:$/.test(u.protocol)) throw new Error('protocol');
      } catch {
        e.url = t('Enter a full link starting with https://', 'Masukkan tautan lengkap yang diawali https://');
      }
    }
    if (title.trim().length < 3) e.title = t('Give it a clear title (3+ characters).', 'Beri judul yang jelas (3+ karakter).');
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const analyse = async () => {
    if (!validate()) return;
    setStep('analyzing');
    setPhase(0);
    const started = Date.now();
    const tick = setInterval(() => setPhase((p) => Math.min(p + 1, PHASES.length - 1)), 420);
    const extracted: Extracted = mode === 'file' && file ? await extractText(file) : { text: '', method: 'name-only' };
    const analysis = analyzeMaterial({ title: title.trim(), text: extracted.text, note, url: mode === 'link' ? url.trim() : undefined, kind: mode === 'link' ? 'link' : kind, courseId: courseId || undefined, major: profile.major });
    // Keep the steps readable even when analysis is instant.
    await new Promise((r) => setTimeout(r, Math.max(0, 1700 - (Date.now() - started))));
    clearInterval(tick);
    setResult({ analysis, extracted });
    if (analysis.courseId) setCourseId(analysis.courseId);
    setStep('review');
  };

  const save = () => {
    if (!result) return;
    const m: Material = {
      id: uid('mat'),
      title: title.trim(),
      kind: mode === 'link' ? 'link' : kind,
      source: mode === 'link' ? 'link' : sample ? 'sample' : 'file',
      fileName: mode === 'file' ? file?.name : undefined,
      ext: mode === 'file' && file ? extOf(file.name) : undefined,
      size: mode === 'file' ? file?.size : undefined,
      url: mode === 'link' ? url.trim() : undefined,
      courseId: courseId || undefined,
      note: note.trim() || undefined,
      skills: result.analysis.skills,
      keywords: result.analysis.keywords,
      summary: result.analysis.summary,
      words: result.analysis.words,
      addedAt: new Date().toISOString(),
    };
    useOrbit.getState().addMaterial(m);
    syncAchievements();
    const inVault = location.pathname === '/app/learning' && !location.search.includes('view=map');
    toast.success(t('Added to your Knowledge Vault', 'Ditambahkan ke Knowledge Vault'), {
      description: m.title,
      action: inVault ? undefined : { label: t('Open Vault', 'Buka Vault'), onClick: () => navigate('/app/learning?view=vault') },
    });
    close();
  };

  const role = ROLE_BY_ID[profile.targetRole];
  const analysis = result?.analysis;
  const relevance = analysis ? materialRelevance(analysis, profile.targetRole) : 0;
  const methodLabel: Record<Extracted['method'], string> = {
    slides: t('Read {w} words from the slides', 'Membaca {w} kata dari slide'),
    document: t('Read {w} words from the document', 'Membaca {w} kata dari dokumen'),
    spreadsheet: t('Read {w} words from the spreadsheet', 'Membaca {w} kata dari spreadsheet'),
    pdf: t('Read {w} words from the PDF', 'Membaca {w} kata dari PDF'),
    notebook: t('Read {w} words from the notebook', 'Membaca {w} kata dari notebook'),
    text: t('Read {w} words', 'Membaca {w} kata'),
    'name-only': mode === 'link' ? t('Analysed the link, title and your note', 'Menganalisis tautan, judul, dan catatanmu') : t('No readable text — analysed the title and your note', 'Tidak ada teks terbaca — menganalisis judul dan catatanmu'),
  };

  return (
    <Modal
      open={state.open}
      onOpenChange={(o) => !o && step !== 'analyzing' && close()}
      size="lg"
      title={step === 'review' ? t('Here’s what Orbit found', 'Ini temuan Orbit') : t('Add to your Knowledge Vault', 'Tambah ke Knowledge Vault')}
      description={
        step === 'review'
          ? t('Check the analysis, adjust the class if needed, then save.', 'Periksa hasil analisis, ubah kelas jika perlu, lalu simpan.')
          : t('Slides, notes, assignments, projects or a link — Orbit turns them into skill evidence for your goal.', 'Slide, catatan, tugas, proyek, atau tautan — Orbit mengubahnya menjadi bukti skill untuk tujuanmu.')
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === 'input' && (
          <motion.form
            key="input"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22, ease }}
            onSubmit={(e) => {
              e.preventDefault();
              void analyse();
            }}
            className="space-y-4"
          >
            <Segmented
              full
              label={t('Source', 'Sumber')}
              value={mode}
              onChange={(v) => {
                setMode(v);
                setErr({});
              }}
              options={[
                { value: 'file', label: t('Upload a file', 'Unggah file'), icon: FileUp },
                { value: 'link', label: t('Connect a link', 'Hubungkan tautan'), icon: Link2 },
              ]}
            />

            {mode === 'file' ? (
              <div>
                {file ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-green/35 bg-muted-green/40 p-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-[11px] font-bold uppercase text-green-strong shadow-xs dark:text-green">{extOf(file.name).slice(0, 4)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold">{file.name}</div>
                      <div className="text-[12px] text-muted-foreground">
                        {mb(file.size)}
                        {sample && ` · ${t('sample', 'contoh')}`}
                      </div>
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={() => setFile(null)} aria-label={t('Remove file', 'Hapus file')}>
                      <X />
                    </Button>
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={onDrop}
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-4 focus-within:ring-[var(--ring)]',
                      drag ? 'border-green bg-muted-green/50' : err.file ? 'border-danger/60' : 'border-border-strong hover:border-green/60 hover:bg-surface-2',
                    )}
                  >
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-muted-green text-green-strong dark:text-green">
                      <FileUp className="size-5" aria-hidden />
                    </span>
                    <span className="mt-3 text-[14.5px] font-semibold">{t('Drop a file here or browse', 'Tarik file ke sini atau pilih')}</span>
                    <span className="mt-1 text-[12.5px] text-muted-foreground">PPTX · PDF · DOCX · XLSX · IPYNB · TXT/MD · CSV · SQL · {t('up to {n} MB', 'maks. {n} MB', { n: MAX_FILE_MB })}</span>
                    <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                  </label>
                )}
                {err.file && <p className="mt-1.5 text-[12.5px] font-medium text-danger" role="alert">{err.file}</p>}
                {!file && (
                  <button type="button" onClick={() => pickFile(sampleMaterial(locale), true)} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-green-strong hover:underline dark:text-green">
                    <Wand2 className="size-4" aria-hidden /> {t('No file handy? Try a sample lecture note', 'Tidak ada file? Coba contoh catatan kuliah')}
                  </button>
                )}
              </div>
            ) : (
              <Field label={t('Link', 'Tautan')} htmlFor="mat-url" error={err.url} hint={t('Google Drive, Notion, GitHub, YouTube, LMS… Orbit analyses the link, title and your note.', 'Google Drive, Notion, GitHub, YouTube, LMS… Orbit menganalisis tautan, judul, dan catatanmu.')}>
                <Input
                  id="mat-url"
                  inputMode="url"
                  value={url}
                  aria-invalid={Boolean(err.url)}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setErr((x) => ({ ...x, url: '' }));
                  }}
                  onBlur={() => {
                    if (!title && url) {
                      try {
                        const u = new URL(url.trim());
                        setTitle(prettyTitle(decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() ?? u.hostname)).replace(/-/g, ' '));
                      } catch {
                        // validated on submit
                      }
                    }
                  }}
                  placeholder="https://"
                />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('Title', 'Judul')} htmlFor="mat-title" error={err.title} className="sm:col-span-2">
                <Input id="mat-title" value={title} aria-invalid={Boolean(err.title)} onChange={(e) => setTitle(e.target.value)} placeholder={t('e.g. Statistics – Week 9 slides', 'mis. Statistika – slide pertemuan 9')} />
              </Field>
              {mode === 'file' && (
                <Field label={t('Type', 'Jenis')} htmlFor="mat-kind">
                  <Select id="mat-kind" value={kind} onChange={(e) => setKind(e.target.value as MaterialKind)}>
                    {(['slides', 'notes', 'assignment', 'project'] as MaterialKind[]).map((k) => (
                      <option key={k} value={k}>
                        {l(KIND_LABEL[k])}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label={t('Class (optional)', 'Mata kuliah (opsional)')} htmlFor="mat-course" className={cn(mode === 'link' && 'sm:col-span-2')}>
                <Select id="mat-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                  <option value="">{t('Let Orbit suggest', 'Biar Orbit menyarankan')}</option>
                  {curriculum.map((c) => (
                    <option key={c.id} value={c.id}>
                      {l(c.name)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label={t('What is it about? (optional)', 'Tentang apa? (opsional)')} htmlFor="mat-note" hint={t('A sentence helps — especially for links and scanned PDFs.', 'Satu kalimat sangat membantu — terutama untuk tautan dan PDF hasil scan.')}>
              <Textarea id="mat-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="min-h-[72px]" />
            </Field>

            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Lock className="size-3.5 shrink-0 text-green" aria-hidden /> {t('Analysed on your device. Orbit keeps the analysis, not the file.', 'Dianalisis di perangkatmu. Orbit menyimpan hasil analisis, bukan file-nya.')}
              </p>
              <div className="flex shrink-0 justify-end gap-2">
                <Button variant="secondary" onClick={close}>
                  {t('Cancel', 'Batal')}
                </Button>
                <Button type="submit">
                  <Sparkles /> {t('Analyse', 'Analisis')}
                </Button>
              </div>
            </div>
          </motion.form>
        )}

        {step === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="py-6" role="status" aria-live="polite">
            <ol className="mx-auto max-w-sm space-y-3">
              {PHASES.map((p, i) => {
                const st = i < phase ? 'done' : i === phase ? 'active' : 'idle';
                return (
                  <li key={p.en} className="flex items-center gap-3">
                    <span className={cn('flex size-7 items-center justify-center rounded-full transition-colors', st === 'done' ? 'bg-green text-white' : st === 'active' ? 'bg-muted-green text-green' : 'bg-surface-2 text-subtle-foreground')}>
                      {st === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : st === 'active' ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    <span className={cn('text-[14.5px]', st === 'idle' ? 'text-subtle-foreground' : 'font-medium')}>{l(p)}</span>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}

        {step === 'review' && analysis && result && (
          <motion.div key="review" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.22, ease }} className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface-2/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">{l(KIND_LABEL[mode === 'link' ? 'link' : kind])}</Badge>
                <span className="text-[12px] text-muted-foreground">{methodLabel[result.extracted.method].replace('{w}', analysis.words.toLocaleString())}</span>
              </div>
              <div className="mt-2 font-display text-[17px] font-bold leading-snug">{title.trim()}</div>
              {analysis.summary && <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{analysis.summary}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t('Skills detected', 'Skill terdeteksi')}</span>
                <span className="text-[12.5px] font-semibold">
                  {t('{r}% relevant to {role}', '{r}% relevan untuk {role}', { r: relevance, role: l(role.name) })}
                </span>
              </div>
              {analysis.skills.length ? (
                <ul className="mt-2.5 space-y-2">
                  {analysis.skills.map((s) => {
                    const req = role.requirements.some((r) => r.skill === s.skill);
                    return (
                      <li key={s.skill} className="grid grid-cols-[minmax(0,1fr)_96px_36px] items-center gap-3 text-[13.5px]">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-medium">{l(SKILL_BY_ID[s.skill].name)}</span>
                          {req && <span className="shrink-0 rounded-full bg-muted-green px-1.5 text-[10.5px] font-bold text-green-strong dark:text-green">{t('goal', 'tujuan')}</span>}
                        </span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                          <motion.span className="block h-full rounded-full orbit-gradient" initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 0.7, ease }} />
                        </span>
                        <span className="tabular text-right text-[12.5px] font-bold">{s.score}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 rounded-xl bg-muted-orange/50 p-3 text-[13px]">{t('No clear skills found. Link a class or add a short note, then analyse again.', 'Belum ada skill yang jelas. Hubungkan mata kuliah atau tambah catatan singkat, lalu analisis ulang.')}</p>
              )}
            </div>

            <Field
              label={t('Class', 'Mata kuliah')}
              htmlFor="mat-course-2"
              hint={analysis.courseSuggested && courseId === analysis.courseId ? t('Suggested by Orbit from the content — change it if it’s wrong.', 'Disarankan Orbit dari isinya — ubah jika kurang tepat.') : undefined}
            >
              <Select id="mat-course-2" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">{t('Not linked to a class', 'Tidak terhubung ke mata kuliah')}</option>
                {curriculum.map((c) => (
                  <option key={c.id} value={c.id}>
                    {l(c.name)}
                  </option>
                ))}
              </Select>
            </Field>
            {courseId && COURSE_BY_ID[courseId] && <p className="-mt-2 text-[12.5px] text-muted-foreground">{l(COURSE_BY_ID[courseId].why)}</p>}

            {analysis.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {analysis.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-surface-2 px-2 py-0.5 text-[12px] text-muted-foreground">
                    #{k}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-1">
              <Button variant="ghost" onClick={() => setStep('input')}>
                <ArrowLeft /> {t('Back', 'Kembali')}
              </Button>
              <Button onClick={save}>
                <Check /> {t('Save to Vault', 'Simpan ke Vault')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
