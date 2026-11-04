/**
 * Orbit Career Intelligence — deterministic, explainable scoring.
 *
 * Readiness is the mean of six dimensions. Each dimension is computed from the Career Profile,
 * then grows as the user completes quests (quest.impact × 6 distributed by quest.dims).
 * Every number Orbit shows can be traced back to a reason.
 */
import type { Text } from '@/lib/i18n';
import { ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { OPPORTUNITIES } from '@/data/opportunities';
import type { DimScores, Dimension, Level, Opportunity, Profile, Quest, RoleId } from '@/data/types';
import { clamp, round1 } from '@/lib/utils';

export const DIMENSIONS: Dimension[] = ['skills', 'experience', 'projects', 'education', 'portfolio', 'interview'];

export const DIM_LABEL: Record<Dimension, Text> = {
  skills: { en: 'Skills', id: 'Skill' },
  experience: { en: 'Experience', id: 'Pengalaman' },
  projects: { en: 'Projects', id: 'Proyek' },
  education: { en: 'Education', id: 'Pendidikan' },
  portfolio: { en: 'Portfolio', id: 'Portofolio' },
  interview: { en: 'Interview Readiness', id: 'Kesiapan Wawancara' },
};

export const DIM_SHORT: Record<Dimension, Text> = {
  skills: { en: 'Skills', id: 'Skill' },
  experience: { en: 'Experience', id: 'Pengalaman' },
  projects: { en: 'Projects', id: 'Proyek' },
  education: { en: 'Education', id: 'Pendidikan' },
  portfolio: { en: 'Portfolio', id: 'Portofolio' },
  interview: { en: 'Interview', id: 'Wawancara' },
};

export const DIM_LONG: Record<Dimension, Text> = {
  skills: { en: 'Skill match', id: 'Kecocokan skill' },
  experience: { en: 'Experience', id: 'Pengalaman' },
  projects: { en: 'Project Experience', id: 'Pengalaman Proyek' },
  education: { en: 'Education', id: 'Pendidikan' },
  portfolio: { en: 'Portfolio', id: 'Portofolio' },
  interview: { en: 'Interview Readiness', id: 'Kesiapan Wawancara' },
};

export const DIM_WHY: Record<Dimension, Text> = {
  skills: { en: 'How your skill levels compare with what the role requires, weighted by importance.', id: 'Seberapa dekat level skill-mu dengan kebutuhan peran, dibobot berdasarkan kepentingan.' },
  experience: { en: 'Internships, organisations and work that show you can deliver with others.', id: 'Magang, organisasi, dan pekerjaan yang menunjukkan kamu bisa berkontribusi bersama tim.' },
  projects: { en: 'Projects that prove you can turn ideas into outcomes.', id: 'Proyek yang membuktikan kamu bisa mengubah ide menjadi hasil.' },
  education: { en: 'Your study progress and academic consistency.', id: 'Progres studi dan konsistensi akademikmu.' },
  portfolio: { en: 'Public evidence recruiters can review before talking to you.', id: 'Bukti publik yang bisa dilihat rekruter sebelum berbicara denganmu.' },
  interview: { en: 'Confidence and practice telling your story under pressure.', id: 'Kepercayaan diri dan latihan menceritakan pengalamanmu di bawah tekanan.' },
};

/** Skill dimension: weighted coverage of the target role's requirements. */
export function skillCoverage(profile: Profile, roleId: RoleId = profile.targetRole) {
  const role = ROLE_BY_ID[roleId];
  let got = 0;
  let total = 0;
  for (const r of role.requirements) {
    const lvl = profile.skills[r.skill] ?? 0;
    got += r.weight * Math.min(lvl / r.target, 1);
    total += r.weight;
  }
  return total ? (got / total) * 100 : 0;
}

export function baseDims(profile: Profile): DimScores {
  const exp = profile.experiences.reduce((sum, e) => {
    const pts = { internship: 22, organization: 12, 'part-time': 10, competition: 8, volunteer: 6 }[e.kind];
    return sum + pts;
  }, 19);
  const semBase = profile.semester >= 9 ? 74 : profile.semester >= 7 ? 70 : profile.semester >= 5 ? 62 : profile.semester >= 3 ? 52 : 44;
  return {
    skills: Math.round(skillCoverage(profile)),
    experience: Math.round(clamp(exp, 10, 96)),
    projects: Math.round(clamp(30 + profile.projects.length * 13, 20, 96)),
    education: Math.round(clamp(semBase + Math.round((profile.gpa - 3) * 29), 30, 98)),
    portfolio: Math.round(clamp(25 + (profile.portfolioUrl ? 15 : 0) + profile.portfolioArtifacts * 15, 15, 96)),
    interview: Math.round(clamp(30 + profile.interviewConfidence * 6 + profile.mockInterviews * 6, 20, 96)),
  };
}

/** Dimension scores including growth from quests completed after the baseline. */
export function currentDims(profile: Profile, quests: Quest[]): DimScores {
  const d = baseDims(profile);
  for (const q of quests) {
    if (q.status !== 'done' || q.baseline) continue;
    for (const [k, share] of Object.entries(q.dims) as [Dimension, number][]) {
      d[k] = d[k] + q.impact * 6 * share;
    }
  }
  for (const k of DIMENSIONS) d[k] = round1(clamp(d[k], 0, 100));
  return d;
}

export function readinessOf(d: DimScores) {
  return round1(DIMENSIONS.reduce((s, k) => s + d[k], 0) / DIMENSIONS.length);
}

export function bandOf(score: number): Text {
  if (score >= 85) return { en: 'Ready to apply', id: 'Siap melamar' };
  if (score >= 70) return { en: 'Almost there', id: 'Hampir siap' };
  if (score >= 50) return { en: 'Building momentum', id: 'Sedang bertumbuh' };
  return { en: 'Getting started', id: 'Baru memulai' };
}

// ───────────────────────────────────────────── Gaps & skills

const OPENING_TYPES = new Set<Opportunity['type']>(['job', 'internship', 'event']);

/** Openings (jobs, internships, events) for the role that ask for this skill. */
export function demandFor(skill: string, roleId: RoleId) {
  return OPPORTUNITIES.filter((o) => OPENING_TYPES.has(o.type) && o.roles.includes(roleId) && o.skills.includes(skill));
}

export interface SkillGap {
  skill: string;
  level: Level;
  target: Level;
  weight: number;
  demand: number;
  relevance: number;
  /** Estimated readiness gained by the best next step for this gap. */
  impact: number;
  /** Readiness gained by fully closing the gap. */
  potential: number;
  priority: number;
  isGap: boolean;
  course?: Opportunity;
}

export function bestCourseFor(skill: string, roleId: RoleId) {
  return (
    OPPORTUNITIES.filter((o) => o.type === 'course' && o.closesGap === skill && o.roles.includes(roleId))[0] ??
    OPPORTUNITIES.filter((o) => o.type === 'course' && o.skills.includes(skill)).sort((a, b) => b.readinessImpact - a.readinessImpact)[0]
  );
}

export function skillProfile(profile: Profile): SkillGap[] {
  const role = ROLE_BY_ID[profile.targetRole];
  return role.requirements
    .map((r) => {
      const level = (profile.skills[r.skill] ?? 0) as Level;
      const demand = demandFor(r.skill, role.id).length;
      const gap = Math.max(0, r.target - level);
      const course = bestCourseFor(r.skill, role.id);
      const impact = course?.closesGap === r.skill ? course.readinessImpact : round1(0.8 + r.weight * gap * 0.6);
      return {
        skill: r.skill,
        level,
        target: r.target,
        weight: r.weight,
        demand,
        relevance: Math.min(99, 60 + r.weight * 8 + demand * 1.5),
        impact,
        potential: Math.round(impact * 1.66),
        priority: r.weight * gap * (1 + demand / 10),
        isGap: gap > 0,
        course,
      } satisfies SkillGap;
    })
    .sort((a, b) => b.priority - a.priority || b.relevance - a.relevance);
}

export function topGap(profile: Profile) {
  return skillProfile(profile).find((g) => g.isGap);
}

// ───────────────────────────────────────────── Insights

export interface CareerInsights {
  dims: DimScores;
  readiness: number;
  strength: { dim: Dimension; score: number };
  priorityGap: { dim: Dimension; score: number };
  opportunity?: SkillGap;
  unlocks: number;
}

export function insightsFor(profile: Profile, quests: Quest[]): CareerInsights {
  const dims = currentDims(profile, quests);
  const ranked = DIMENSIONS.filter((d) => d !== 'education').sort((a, b) => dims[b] - dims[a]);
  const strength = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const opportunity = topGap(profile);
  return {
    dims,
    readiness: readinessOf(dims),
    strength: { dim: strength, score: dims[strength] },
    priorityGap: { dim: weakest, score: dims[weakest] },
    opportunity,
    unlocks: opportunity?.demand ?? 0,
  };
}

// ───────────────────────────────────────────── Opportunity matching

export interface Match {
  score: number;
  uses: string[];
  missing: string[];
  closes?: string;
  roleFit: boolean;
  reasons: Text[];
  suitable: boolean;
  milestones: number;
}

export function matchOpportunity(o: Opportunity, profile: Profile, quests: Quest[] = []): Match {
  const role = ROLE_BY_ID[profile.targetRole];
  const roleFit = o.roles.includes(role.id);
  const uses = o.skills.filter((s) => (profile.skills[s] ?? 0) >= 1);
  const missing = o.skills.filter((s) => (profile.skills[s] ?? 0) < 1);
  const coverage = o.skills.reduce((sum, s) => sum + Math.min((profile.skills[s] ?? 0) / 3, 1), 0) / Math.max(o.skills.length, 1);
  const req = role.requirements.find((r) => r.skill === o.closesGap);
  const closes = req && (profile.skills[req.skill] ?? 0) < req.target ? o.closesGap : undefined;
  const learning = o.type === 'course' || o.type === 'book' || o.type === 'research' || o.type === 'mentor';
  const raw = 46 + (roleFit ? 22 : 4) + coverage * 18 + (closes ? 8 : 0) + (learning ? 2 : 0) + (o.signal ?? 0);
  const score = Math.round(clamp(raw, 35, 98));
  const suitable = o.level !== 'Advanced';
  const milestones = new Set(quests.filter((q) => q.status !== 'done' && q.skill && o.skills.includes(q.skill)).map((q) => q.milestoneId)).size;

  const reasons: Text[] = [];
  if (roleFit) reasons.push({ en: `Matches your ${tName(role.name)} target`, id: `Sesuai target ${tName(role.name, 'id')}-mu` });
  if (uses.length) reasons.push({ en: `Uses ${uses.length} of your existing skills`, id: `Memakai ${uses.length} skill yang sudah kamu miliki` });
  if (closes) reasons.push({ en: `Helps close your ${tName(SKILL_BY_ID[closes].name)} gap`, id: `Membantu menutup gap ${tName(SKILL_BY_ID[closes].name, 'id')}` });
  if (suitable) reasons.push({ en: 'Suitable for your current readiness', id: 'Sesuai dengan kesiapanmu saat ini' });
  if (milestones) reasons.push({ en: `Relevant to ${milestones} active journey milestone${milestones > 1 ? 's' : ''}`, id: `Relevan dengan ${milestones} milestone aktif di journey-mu` });
  return { score, uses, missing, closes, roleFit, reasons, suitable, milestones };
}

function tName(t: Text, lang: 'en' | 'id' = 'en') {
  return typeof t === 'string' ? t : t[lang];
}

// ───────────────────────────────────────────── Next Best Action

export interface NextAction {
  key: string;
  title: Text;
  reason: Text;
  impact: number;
  stage: 'add' | 'start' | 'complete' | 'apply';
  questId?: string;
  oppId?: string;
  skill?: string;
}

export function nextBestAction(profile: Profile, quests: Quest[]): NextAction | null {
  const gaps = skillProfile(profile).filter((g) => g.isGap);
  for (const g of gaps) {
    const course = g.course;
    if (!course) continue;
    const quest = quests.find((q) => q.resourceId === course.id || q.templateId === `opp:${course.id}`);
    const skillName = SKILL_BY_ID[g.skill].name;
    const why: Text = {
      en: `${tName(skillName)} is required by ${g.demand} opportunities matching your ${tName(ROLE_BY_ID[profile.targetRole].name)} target.`,
      id: `${tName(skillName, 'id')} dibutuhkan oleh ${g.demand} peluang yang cocok dengan target ${tName(ROLE_BY_ID[profile.targetRole].name, 'id')}-mu.`,
    };
    if (!quest) return { key: `add:${course.id}`, title: { en: `Complete ${course.title}`, id: `Selesaikan ${course.title}` }, reason: why, impact: course.readinessImpact, stage: 'add', oppId: course.id, skill: g.skill };
    if (quest.status === 'todo') return { key: `start:${quest.id}`, title: { en: `Start ${course.title}`, id: `Mulai ${course.title}` }, reason: why, impact: quest.impact, stage: 'start', questId: quest.id, oppId: course.id, skill: g.skill };
    if (quest.status === 'doing') return { key: `complete:${quest.id}`, title: { en: `Complete ${course.title}`, id: `Selesaikan ${course.title}` }, reason: why, impact: quest.impact, stage: 'complete', questId: quest.id, oppId: course.id, skill: g.skill };
  }
  const open = quests.filter((q) => q.status !== 'done').sort((a, b) => (b.status === 'doing' ? 1 : 0) - (a.status === 'doing' ? 1 : 0) || b.impact - a.impact)[0];
  if (open) {
    return {
      key: `q:${open.id}`,
      title: open.title,
      reason: { en: 'This is the highest-impact open quest in your journey.', id: 'Ini quest terbuka dengan dampak terbesar di journey-mu.' },
      impact: open.impact,
      stage: open.status === 'doing' ? 'complete' : 'start',
      questId: open.id,
      oppId: open.resourceId,
    };
  }
  return null;
}

// ───────────────────────────────────────────── Levels & XP

const LEVELS = [0, 200, 450, 800, 1200, 1600, 2000, 3000, 4200, 5600, 7200];

export function levelInfo(xp: number) {
  let level = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) level = i + 1;
  const floor = LEVELS[level - 1] ?? 0;
  const ceil = LEVELS[level] ?? floor + 2000;
  const title: Text =
    level >= 10
      ? { en: 'Career Ready', id: 'Siap Berkarier' }
      : level >= 8
        ? { en: 'Career Builder', id: 'Career Builder' }
        : level >= 5
          ? { en: 'Career Explorer', id: 'Career Explorer' }
          : level >= 3
            ? { en: 'Pathfinder', id: 'Pathfinder' }
            : { en: 'Starter', id: 'Starter' };
  return { level, floor, ceil, title, progress: ((xp - floor) / (ceil - floor)) * 100 };
}
