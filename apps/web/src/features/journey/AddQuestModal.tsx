import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/overlays';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { useOrbit } from '@/store/orbit';
import { KIND_DIMS, KIND_LABEL, MILESTONES } from '@/data/journey';
import { ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import type { QuestKind } from '@/data/types';
import { useT } from '@/lib/i18n';
import { uid } from '@/lib/utils';

const XP: Record<QuestKind, number> = { learn: 140, build: 180, connect: 120, apply: 200, practice: 120, reflect: 60 };

export function AddQuestModal({ open, onClose, defaultMilestone }: { open: boolean; onClose: () => void; defaultMilestone?: string }) {
  const addQuest = useOrbit((s) => s.addQuest);
  const profile = useOrbit((s) => s.profile)!;
  const { t, l } = useT();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [milestone, setMilestone] = useState('foundation');
  const [kind, setKind] = useState<QuestKind>('learn');
  const [skill, setSkill] = useState('');
  const [due, setDue] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setDesc('');
      setMilestone(defaultMilestone ?? 'foundation');
      setKind('learn');
      setSkill('');
      setDue('');
      setErr('');
    }
  }, [open, defaultMilestone]);

  const submit = () => {
    if (title.trim().length < 3) return setErr(t('Give your quest a clear title (3+ characters)', 'Beri judul quest yang jelas (3+ karakter)'));
    addQuest({
      id: uid('q'),
      title: title.trim(),
      description: desc.trim() || t('A personal quest in your journey.', 'Quest pribadi di journey-mu.'),
      milestoneId: milestone,
      status: 'todo',
      kind,
      xp: XP[kind],
      impact: kind === 'apply' ? 1.6 : kind === 'build' ? 1.4 : 1.0,
      dims: KIND_DIMS[kind],
      skill: skill || undefined,
      due: due || undefined,
      createdAt: new Date().toISOString(),
      steps: [],
      order: 0,
    });
    toast.success(t('Quest added', 'Quest ditambahkan'), { description: title.trim() });
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()} title={t('Add a quest', 'Tambah quest')} description={t('Break your goal into a concrete step.', 'Pecah tujuanmu menjadi langkah konkret.')}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        <Field label={t('Quest title', 'Judul quest')} htmlFor="aq-title" error={err}>
          <Input id="aq-title" autoFocus aria-invalid={Boolean(err)} value={title} onChange={(e) => { setTitle(e.target.value); setErr(''); }} placeholder={t('e.g. Interview a product manager', 'mis. Wawancarai seorang product manager')} />
        </Field>
        <Field label={t('Description (optional)', 'Deskripsi (opsional)')} htmlFor="aq-desc">
          <Textarea id="aq-desc" value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-[80px]" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('Milestone', 'Milestone')} htmlFor="aq-ms">
            <Select id="aq-ms" value={milestone} onChange={(e) => setMilestone(e.target.value)}>
              {MILESTONES.map((m) => (
                <option key={m.id} value={m.id}>
                  {l(m.title)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('Type', 'Jenis')} htmlFor="aq-kind" hint={`+${XP[kind]} XP`}>
            <Select id="aq-kind" value={kind} onChange={(e) => setKind(e.target.value as QuestKind)}>
              {(Object.keys(KIND_LABEL) as QuestKind[]).map((k) => (
                <option key={k} value={k}>
                  {l(KIND_LABEL[k])}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('Skill (optional)', 'Skill (opsional)')} htmlFor="aq-skill">
            <Select id="aq-skill" value={skill} onChange={(e) => setSkill(e.target.value)}>
              <option value="">—</option>
              {ROLE_BY_ID[profile.targetRole].requirements.map((r) => (
                <option key={r.skill} value={r.skill}>
                  {l(SKILL_BY_ID[r.skill].name)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('Due date (optional)', 'Tenggat (opsional)')} htmlFor="aq-due">
            <Input id="aq-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            {t('Cancel', 'Batal')}
          </Button>
          <Button type="submit">
            <Plus /> {t('Add quest', 'Tambah quest')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
