/**
 * Orbit Career Agent — context-aware guidance composed from the user's live Career Intelligence.
 * Every reply follows Context → Insight → Reason → Action, and actions that change career data
 * always pass through a confirmation step in the UI.
 */
import { tr, tx } from '@/lib/i18n';
import { ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { OPPORTUNITIES, OPP_BY_ID } from '@/data/opportunities';
import type { Profile, Quest, QuestStatus, SavedItem } from '@/data/types';
import { DIM_LONG, insightsFor, matchOpportunity, nextBestAction, skillProfile } from './intelligence';

export type AgentAction =
  | { kind: 'add-opp'; oppId: string; label: string; primary?: boolean }
  | { kind: 'move-quest'; questId: string; status: QuestStatus; label: string; primary?: boolean }
  | { kind: 'open'; to: string; label: string; primary?: boolean }
  | { kind: 'alternatives'; skill: string; label: string; primary?: boolean }
  | { kind: 'save-opp'; oppId: string; label: string; primary?: boolean };

export interface AgentReply {
  intent: string;
  headline: string;
  context?: string;
  reason?: string;
  impact?: number;
  bullets?: { label: string; value?: string }[];
  oppIds?: string[];
  actions?: AgentAction[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  text?: string;
  reply?: AgentReply;
  at: string;
}

export interface AgentContext {
  profile: Profile;
  quests: Quest[];
  saved: Record<string, SavedItem>;
  streak: number;
  readiness30dAgo: number;
  page: string;
}

export const SUGGESTIONS = [
  { en: 'What should I do next?', id: 'Apa yang harus saya lakukan selanjutnya?' },
  { en: 'What is my biggest career gap?', id: 'Apa gap karier terbesar saya?' },
  { en: 'Which opportunity fits me best?', id: 'Peluang mana yang paling cocok untuk saya?' },
  { en: 'How can I improve my readiness?', id: 'Bagaimana cara meningkatkan kesiapan saya?' },
  { en: 'Build me a learning plan.', id: 'Buatkan saya rencana belajar.' },
];

const INTENTS: [string, RegExp][] = [
  ['alternatives', /alternativ|other option|pilihan lain|alternatif/i],
  ['gap', /gap|weak|lack|missing|kekurangan|kelemahan|celah|kurang/i],
  ['opportunity', /opportunit|job|intern|fit|role|peluang|lowongan|magang|pekerjaan|cocok/i],
  ['plan', /plan|learning|roadmap|schedule|week|rencana|belajar|jadwal|minggu/i],
  ['interview', /interview|wawancara/i],
  ['mentor', /mentor|people|network|orang|jaringan/i],
  ['improve', /improve|readiness|increase|boost|faster|tingkat|kesiapan|naik|cepat/i],
  ['progress', /progress|how am i|doing|perkembangan|sejauh|kemajuan/i],
  ['next', /next|what should|today|focus|start|selanjutnya|harus|lakukan|fokus|mulai|hari ini/i],
  ['hello', /^(hi|hello|hey|halo|hai|pagi|siang|sore|malam)\b/i],
  ['thanks', /thank|thanks|makasih|terima kasih/i],
];

export function detectIntent(text: string) {
  for (const [intent, re] of INTENTS) if (re.test(text)) return intent;
  return 'fallback';
}

const pct = (n: number) => `${Math.round(n)}%`;

export function composeReply(intent: string, ctx: AgentContext, arg?: string): AgentReply {
  const { profile, quests } = ctx;
  const ins = insightsFor(profile, quests);
  const role = ROLE_BY_ID[profile.targetRole];
  const roleName = tx(role.name);
  const first = profile.name.split(' ')[0];
  const nba = nextBestAction(profile, quests);
  const gaps = skillProfile(profile).filter((g) => g.isGap);
  const gap = gaps[0];
  const gapName = gap ? tx(SKILL_BY_ID[gap.skill].name) : '';
  const context = tr(
    'Based on your {role} goal and current {r} readiness.',
    'Berdasarkan tujuan {role} dan kesiapanmu saat ini {r}.',
    { role: roleName, r: pct(ins.readiness) },
  );

  const nbaActions = (): AgentAction[] => {
    if (!nba) return [{ kind: 'open', to: '/app/discover', label: tr('Explore opportunities', 'Jelajahi peluang'), primary: true }];
    const alt: AgentAction[] = nba.skill ? [{ kind: 'alternatives', skill: nba.skill, label: tr('Explore Alternatives', 'Lihat Alternatif') }] : [];
    if (nba.stage === 'add' && nba.oppId) return [{ kind: 'add-opp', oppId: nba.oppId, label: tr('Add to Journey', 'Tambah ke Journey'), primary: true }, ...alt];
    if (nba.stage === 'start' && nba.questId) return [{ kind: 'move-quest', questId: nba.questId, status: 'doing', label: tr('Start quest', 'Mulai quest'), primary: true }, ...alt];
    if (nba.questId) return [{ kind: 'open', to: `/app/journey?quest=${nba.questId}`, label: tr('Continue in Journey', 'Lanjutkan di Journey'), primary: true }, ...alt];
    return alt;
  };

  switch (intent) {
    case 'next':
      if (!nba) return { intent, headline: tr('Your journey is clear for now.', 'Journey-mu sedang kosong.'), context, reason: tr('Add a goal-aligned quest to keep momentum.', 'Tambahkan quest yang selaras dengan tujuan untuk menjaga momentum.'), actions: nbaActions() };
      return {
        intent,
        headline: tr('Your next best action: {a}.', 'Langkah terbaikmu berikutnya: {a}.', { a: tx(nba.title) }),
        context,
        reason: tx(nba.reason),
        impact: nba.impact,
        actions: nbaActions(),
      };

    case 'gap':
      if (!gap) return { intent, headline: tr('You meet every skill requirement for {role}.', 'Kamu sudah memenuhi semua kebutuhan skill untuk {role}.', { role: roleName }), context, reason: tr('Focus on evidence: projects, portfolio and interviews.', 'Fokus pada bukti: proyek, portofolio, dan wawancara.') };
      return {
        intent,
        headline: tr('Your biggest gap right now is {g}.', 'Gap terbesarmu saat ini adalah {g}.', { g: gapName }),
        context,
        reason: tr(
          'It is required by {n} opportunities currently matching your {role} target. You are {lvl}; most openings expect {tgt}.',
          'Skill ini dibutuhkan oleh {n} peluang yang cocok dengan target {role}-mu. Level kamu {lvl}; sebagian besar lowongan mengharapkan {tgt}.',
          { n: gap.demand, role: roleName, lvl: levelName(gap.level), tgt: levelName(gap.target) },
        ),
        bullets: [
          { label: tr('Second priority', 'Prioritas kedua'), value: gaps[1] ? tx(SKILL_BY_ID[gaps[1].skill].name) : '—' },
          { label: tr('Weakest dimension', 'Dimensi terlemah'), value: `${tx(DIM_LONG[ins.priorityGap.dim])} · ${pct(ins.priorityGap.score)}` },
        ],
        impact: gap.impact,
        actions: nbaActions(),
      };

    case 'opportunity': {
      const ranked = OPPORTUNITIES.filter((o) => o.type === 'job' || o.type === 'internship')
        .map((o) => ({ o, m: matchOpportunity(o, profile, quests) }))
        .sort((a, b) => b.m.score - a.m.score)
        .slice(0, 3);
      const best = ranked[0];
      return {
        intent,
        headline: tr('{t} at {org} fits you best — {s}% match.', '{t} di {org} paling cocok untukmu — {s}% match.', { t: best.o.title, org: best.o.org, s: best.m.score }),
        context,
        reason: best.m.reasons.slice(0, 3).map((r) => tx(r)).join(' · '),
        oppIds: ranked.map((r) => r.o.id),
        actions: [
          ctx.saved[best.o.id]
            ? { kind: 'open', to: `/app/discover?view=saved`, label: tr('View saved', 'Lihat tersimpan'), primary: true }
            : { kind: 'save-opp', oppId: best.o.id, label: tr('Save opportunity', 'Simpan peluang'), primary: true },
          { kind: 'open', to: '/app/discover', label: tr('See all matches', 'Lihat semua match') },
        ],
      };
    }

    case 'improve': {
      const top = gaps.slice(0, 2);
      const interviewQ = quests.find((q) => q.kind === 'practice' && q.status !== 'done');
      const bullets = [
        ...top.map((g) => ({ label: tr('Close {s}', 'Tutup gap {s}', { s: tx(SKILL_BY_ID[g.skill].name) }), value: `+${g.impact}%` })),
        ...(interviewQ ? [{ label: tx(interviewQ.title), value: `+${interviewQ.impact}%` }] : []),
      ];
      const total = bullets.reduce((s, b) => s + parseFloat(b.value ?? '0'), 0);
      return {
        intent,
        headline: tr('Three moves could add about +{n}% readiness.', 'Tiga langkah bisa menambah sekitar +{n}% kesiapan.', { n: total.toFixed(1) }),
        context,
        reason: tr('Ranked by impact on your weakest dimensions and by how many matching opportunities each unlocks.', 'Diurutkan berdasarkan dampak pada dimensi terlemahmu dan jumlah peluang yang terbuka.'),
        bullets,
        actions: nbaActions(),
      };
    }

    case 'plan': {
      const g1 = gaps[0];
      const g2 = gaps[1];
      const weeks = [
        g1?.course && { label: tr('Week 1–2', 'Minggu 1–2'), value: g1.course.title },
        g2?.course && { label: tr('Week 3', 'Minggu 3'), value: g2.course.title },
        { label: tr('Week 4', 'Minggu 4'), value: tr('Apply it in a case study', 'Terapkan dalam studi kasus') },
        { label: tr('Then', 'Lalu'), value: tr('Mock interview with a mentor', 'Mock interview dengan mentor') },
      ].filter(Boolean) as { label: string; value: string }[];
      return {
        intent,
        headline: tr('Here is a focused 4-week learning plan.', 'Berikut rencana belajar 4 minggu yang fokus.'),
        context,
        reason: tr('Learning first closes your top gaps; the case study turns it into evidence recruiters can see.', 'Belajar dulu menutup gap utama; studi kasus mengubahnya menjadi bukti yang bisa dilihat rekruter.'),
        bullets: weeks,
        impact: Math.round(((g1?.impact ?? 0) + (g2?.impact ?? 0)) * 10) / 10,
        actions: nbaActions(),
      };
    }

    case 'interview': {
      const q = quests.find((x) => x.kind === 'practice' && x.status !== 'done');
      return {
        intent,
        headline: tr('Interview Readiness is at {s} — let’s raise it.', 'Kesiapan Wawancara ada di {s} — ayo tingkatkan.', { s: pct(ins.dims.interview) }),
        context,
        reason: tr('Five STAR stories and one recorded mock interview usually make the biggest difference for first-round interviews.', 'Lima cerita STAR dan satu mock interview terekam biasanya paling berdampak untuk wawancara tahap awal.'),
        oppIds: ['course-interview', 'mentor-raka'],
        impact: q?.impact ?? 3.1,
        actions: q
          ? q.status === 'todo'
            ? [{ kind: 'move-quest', questId: q.id, status: 'doing', label: tr('Start practice quest', 'Mulai quest latihan'), primary: true }]
            : [{ kind: 'open', to: `/app/journey?quest=${q.id}`, label: tr('Continue practice', 'Lanjutkan latihan'), primary: true }]
          : [{ kind: 'add-opp', oppId: 'course-interview', label: tr('Add to Journey', 'Tambah ke Journey'), primary: true }],
      };
    }

    case 'mentor': {
      const mentors = OPPORTUNITIES.filter((o) => o.type === 'mentor')
        .map((o) => ({ o, m: matchOpportunity(o, profile, quests) }))
        .sort((a, b) => (b.o.closesGap === gap?.skill ? 10 : 0) + b.m.score - ((a.o.closesGap === gap?.skill ? 10 : 0) + a.m.score))
        .slice(0, 2);
      const m = mentors[0].o;
      return {
        intent,
        headline: tr('Talk to {name} — {meta}.', 'Ngobrol dengan {name} — {meta}.', { name: m.title, meta: tx(m.meta ?? '') }),
        context,
        reason: tr('{name} works on {g} every day, which is your top gap. One session can shortcut weeks of trial and error.', '{name} menangani {g} setiap hari, yang merupakan gap utamamu. Satu sesi bisa memangkas waktu belajar berminggu-minggu.', { name: m.title.split(' ')[0], g: gapName || roleName }),
        oppIds: mentors.map((x) => x.o.id),
        impact: m.readinessImpact,
        actions: [{ kind: 'add-opp', oppId: m.id, label: tr('Add session to Journey', 'Tambah sesi ke Journey'), primary: true }],
      };
    }

    case 'progress': {
      const done = quests.filter((q) => q.status === 'done' && !q.baseline).length;
      const delta = Math.round((ins.readiness - ctx.readiness30dAgo) * 10) / 10;
      return {
        intent,
        headline: tr('You are {r} ready for {role}.', 'Kamu {r} siap untuk {role}.', { r: pct(ins.readiness), role: roleName }),
        context: tr('Your strongest area is {s}; your biggest growth area is {g}.', 'Area terkuatmu adalah {s}; area pertumbuhan terbesar adalah {g}.', {
          s: tx(DIM_LONG[ins.strength.dim]),
          g: gapName || tx(DIM_LONG[ins.priorityGap.dim]),
        }),
        bullets: [
          { label: tr('Last 30 days', '30 hari terakhir'), value: `${delta >= 0 ? '+' : ''}${delta}%` },
          { label: tr('Quests completed recently', 'Quest selesai baru-baru ini'), value: String(done) },
          { label: tr('Growth streak', 'Growth streak'), value: tr('{n} days', '{n} hari', { n: ctx.streak }) },
        ],
        actions: [{ kind: 'open', to: '/app/progress', label: tr('Open Progress', 'Buka Progress'), primary: true }],
      };
    }

    case 'alternatives': {
      const skill = arg ?? gap?.skill ?? 'product-analytics';
      const alts = OPPORTUNITIES.filter((o) => o.skills.includes(skill) && ['course', 'mentor', 'book', 'event'].includes(o.type))
        .sort((a, b) => b.readinessImpact - a.readinessImpact)
        .slice(0, 4);
      return {
        intent,
        headline: tr('Other ways to build {s}.', 'Cara lain membangun {s}.', { s: tx(SKILL_BY_ID[skill]?.name ?? skill) }),
        context: tr('Pick what fits your time and learning style.', 'Pilih yang sesuai dengan waktu dan gaya belajarmu.'),
        oppIds: alts.map((o) => o.id),
        actions: [{ kind: 'open', to: `/app/discover?skill=${skill}`, label: tr('Explore in Discover', 'Jelajahi di Discover'), primary: true }],
      };
    }

    case 'hello':
      return {
        intent,
        headline: tr('Hi {n}! Ready to make progress today?', 'Hai {n}! Siap bertumbuh hari ini?', { n: first }),
        context,
        reason: nba ? tr('Your best move right now: {a} (+{i}% readiness).', 'Langkah terbaikmu sekarang: {a} (+{i}% kesiapan).', { a: tx(nba.title), i: nba.impact }) : undefined,
        actions: nbaActions(),
      };

    case 'thanks':
      return { intent, headline: tr('Anytime, {n}. Small steps compound.', 'Sama-sama, {n}. Langkah kecil akan berlipat.', { n: first }), context: tr('I’ll keep watching your journey and opportunities.', 'Aku akan terus memantau journey dan peluangmu.') };

    default:
      return {
        intent: 'fallback',
        headline: tr('I can help you decide what matters next.', 'Aku bisa membantumu menentukan apa yang penting berikutnya.'),
        context,
        reason: tr('Ask about your next step, your biggest gap, which opportunity fits, or a learning plan.', 'Tanyakan langkah berikutnya, gap terbesarmu, peluang yang cocok, atau rencana belajar.'),
        actions: nbaActions(),
      };
  }
}

function levelName(l: number) {
  return [tr('not started', 'belum mulai'), tr('Beginner', 'Pemula'), tr('Intermediate', 'Menengah'), tr('Advanced', 'Mahir'), tr('Expert', 'Ahli')][l] ?? '';
}

export function oppTitle(id: string) {
  return OPP_BY_ID[id]?.title ?? id;
}
