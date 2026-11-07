/**
 * User-facing flows: store mutation + confirmation + feedback, shared by every page and the agent.
 */
import { toast } from 'sonner';
import { tr, tx } from '@/lib/i18n';
import { OPP_BY_ID, TYPE_LABEL } from '@/data/opportunities';
import { KIND_DIMS, MILESTONE_BY_ID, questFromOpportunity } from '@/data/journey';
import type { Course } from '@/data/courses';
import type { Quest, QuestStatus } from '@/data/types';
import { uid } from '@/lib/utils';
import { useOrbit } from './orbit';
import { useUi } from './ui';
import { announceAchievements, celebrateQuest, sparkleToast } from '@/lib/feedback';

const orbit = () => useOrbit.getState();

function syncAchievements() {
  const fresh = orbit().syncAchievements();
  if (fresh.length) announceAchievements(fresh);
}

/** Find a quest already created from this opportunity. */
export function questForOpportunity(oppId: string) {
  return orbit().quests.find((q) => q.resourceId === oppId || q.templateId === `opp:${oppId}`);
}

/** Ask to add an opportunity/resource to the Journey (human-in-the-loop). */
export function requestAddToJourney(oppId: string, onAdded?: (questId: string) => void) {
  const o = OPP_BY_ID[oppId];
  if (!o) return;
  const existing = questForOpportunity(oppId);
  if (existing) {
    toast(tr('Already in your Journey', 'Sudah ada di Journey-mu'), {
      description: tx(existing.title),
      action: onAdded ? { label: tr('Open', 'Buka'), onClick: () => onAdded(existing.id) } : undefined,
    });
    return;
  }
  const quest = questFromOpportunity(o, 0, o.deadlineInDays ? new Date(Date.now() + Math.max(o.deadlineInDays - 1, 1) * 86_400_000).toISOString().slice(0, 10) : undefined);
  useUi.getState().askConfirm({
    title: tr('Orbit wants to update your Journey', 'Orbit ingin memperbarui Journey-mu'),
    description: tr('This adds a new quest to “{m}”. You can move or remove it anytime.', 'Ini menambahkan quest baru ke “{m}”. Kamu bisa memindahkan atau menghapusnya kapan saja.', {
      m: tx(MILESTONE_BY_ID[quest.milestoneId].title),
    }),
    items: [{ label: o.type === 'course' ? o.title : tx(quest.title), meta: `${tx(TYPE_LABEL[o.type])} · ${o.org}` }],
    impact: o.readinessImpact,
    icon: 'journey',
    confirmLabel: tr('Confirm & Add', 'Konfirmasi & Tambah'),
    onConfirm: () => {
      orbit().addQuest(quest);
      syncAchievements();
      sparkleToast(tr('Journey updated', 'Journey diperbarui'), tx(quest.title), onAdded ? { label: tr('View', 'Lihat'), onClick: () => onAdded(quest.id) } : undefined);
      onAdded?.(quest.id);
    },
  });
}

export function moveQuest(id: string, status: QuestStatus, beforeId?: string | null) {
  const res = orbit().moveQuest(id, status, beforeId);
  if (res.completed && res.quest) {
    celebrateQuest({ title: tx(res.quest.title), xp: res.quest.xp, delta: res.readinessDelta });
    syncAchievements();
  } else if (status === 'doing' && res.quest) {
    toast(tr('Quest started', 'Quest dimulai'), { description: tx(res.quest.title) });
  }
  return res;
}

export function deleteQuest(id: string) {
  const q = orbit().deleteQuest(id);
  if (!q) return;
  toast(tr('Quest removed', 'Quest dihapus'), {
    description: tx(q.title),
    action: { label: tr('Undo', 'Urungkan'), onClick: () => orbit().restoreQuest(q) },
  });
}

export function toggleSave(oppId: string) {
  const o = OPP_BY_ID[oppId];
  const saved = orbit().toggleSave(oppId);
  if (saved) {
    syncAchievements();
    toast.success(tr('Saved to your opportunities', 'Disimpan ke peluangmu'), {
      description: o?.title,
      action: { label: tr('Undo', 'Urungkan'), onClick: () => orbit().toggleSave(oppId) },
    });
  } else {
    toast(tr('Removed from saved', 'Dihapus dari tersimpan'), {
      description: o?.title,
      action: { label: tr('Undo', 'Urungkan'), onClick: () => orbit().toggleSave(oppId) },
    });
  }
  return saved;
}

export function setStatus(oppId: string, status: Parameters<ReturnType<typeof useOrbit.getState>['setAppStatus']>[1]) {
  orbit().setAppStatus(oppId, status);
  syncAchievements();
}

export function addJournal(...args: Parameters<ReturnType<typeof useOrbit.getState>['addJournal']>) {
  const e = orbit().addJournal(...args);
  syncAchievements();
  return e;
}

export function requestReset(onDone?: () => void) {
  useUi.getState().askConfirm({
    title: tr('Restore Orbit demo to its initial state?', 'Kembalikan demo Orbit ke kondisi awal?'),
    description: tr('Quests, saved opportunities, reminders, journal entries and agent history return to Naya’s starting point.', 'Quest, peluang tersimpan, pengingat, journal, dan riwayat agent kembali ke titik awal Naya.'),
    icon: 'reset',
    tone: 'danger',
    confirmLabel: tr('Reset demo', 'Reset demo'),
    onConfirm: () => {
      orbit().resetDemo();
      toast.success(tr('Demo restored', 'Demo dipulihkan'), { description: tr('Everything is back to the starting point.', 'Semua kembali ke titik awal.') });
      onDone?.();
    },
  });
}

export { syncAchievements };

/** Ask to add a class's applied project to the Journey as a “Prove Skills” quest (human-in-the-loop). */
export function requestClassQuest(course: Course, skill: string | undefined, onAdded?: () => void) {
  const templateId = `class:${course.id}`;
  const existing = orbit().quests.find((q) => q.templateId === templateId);
  if (existing) {
    toast(tr('Already in your Journey', 'Sudah ada di Journey-mu'), { description: tx(existing.title) });
    return;
  }
  const name = { en: tx(course.name, 'en'), id: tx(course.name, 'id') };
  const step = (id: string, en: string, idn: string) => ({ id, title: { en, id: idn }, done: false });
  const quest: Quest = {
    id: uid('q'),
    templateId,
    title: { en: `Turn “${name.en}” into evidence`, id: `Jadikan “${name.id}” bukti nyata` },
    description: course.project,
    milestoneId: 'prove',
    status: 'todo',
    kind: 'build',
    xp: 180,
    impact: 1.4,
    dims: KIND_DIMS.build,
    skill,
    createdAt: new Date().toISOString(),
    steps: [
      step('s1', 'Agree the scope with your lecturer', 'Sepakati cakupannya dengan dosen'),
      step('s2', 'Build it alongside the class assignment', 'Kerjakan bersamaan dengan tugas kuliah'),
      step('s3', 'Publish it to your portfolio', 'Publikasikan ke portofolio'),
    ],
    order: 0,
  };
  useUi.getState().askConfirm({
    title: tr('Orbit wants to update your Journey', 'Orbit ingin memperbarui Journey-mu'),
    description: tr('This adds an applied class project to “{m}”. You can move or remove it anytime.', 'Ini menambahkan proyek terapan dari mata kuliah ke “{m}”. Kamu bisa memindahkan atau menghapusnya kapan saja.', {
      m: tx(MILESTONE_BY_ID[quest.milestoneId].title),
    }),
    items: [{ label: tx(quest.title), meta: tx(course.project) }],
    impact: quest.impact,
    icon: 'journey',
    confirmLabel: tr('Confirm & Add', 'Konfirmasi & Tambah'),
    onConfirm: () => {
      orbit().addQuest(quest);
      syncAchievements();
      sparkleToast(tr('Journey updated', 'Journey diperbarui'), tx(quest.title));
      onAdded?.();
    },
  });
}
