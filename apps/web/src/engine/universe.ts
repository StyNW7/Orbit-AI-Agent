import type { Text } from '@/lib/i18n';
import { ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import { OPPORTUNITIES } from '@/data/opportunities';
import type { Opportunity, Profile, Quest } from '@/data/types';
import { matchOpportunity, skillProfile } from './intelligence';

export type UCat = 'you' | 'hub' | 'role' | 'skill' | 'gap' | 'experience' | 'project' | 'opportunity' | 'course' | 'mentor' | 'event' | 'book' | 'research';
export type UFilter = 'all' | 'career' | 'skills' | 'experience' | 'opportunity' | 'learning' | 'people' | 'gap';
export type HubKey = 'role' | 'skills' | 'experience' | 'projects' | 'opportunities' | 'courses' | 'mentors' | 'events' | 'books' | 'research';

export interface UNode {
  id: string;
  cat: UCat;
  hub?: HubKey;
  label: Text;
  sub?: Text;
  x: number;
  y: number;
  refId?: string;
  score?: number;
  groups: UFilter[];
  order: number;
  count?: number;
}

export interface UEdge {
  id: string;
  source: string;
  target: string;
  kind: 'spoke' | 'branch' | 'link';
}

export const HUBS: { key: HubKey; label: Text; groups: UFilter[] }[] = [
  { key: 'role', label: { en: 'Target Role', id: 'Peran Target' }, groups: ['career'] },
  { key: 'skills', label: { en: 'Skills', id: 'Skill' }, groups: ['skills'] },
  { key: 'opportunities', label: { en: 'Opportunities', id: 'Peluang' }, groups: ['opportunity'] },
  { key: 'courses', label: { en: 'Courses', id: 'Kursus' }, groups: ['learning'] },
  { key: 'mentors', label: { en: 'Mentors', id: 'Mentor' }, groups: ['people'] },
  { key: 'events', label: { en: 'Events', id: 'Event' }, groups: ['opportunity', 'people'] },
  { key: 'books', label: { en: 'Books', id: 'Buku' }, groups: ['learning'] },
  { key: 'research', label: { en: 'Research', id: 'Riset' }, groups: ['learning'] },
  { key: 'projects', label: { en: 'Projects', id: 'Proyek' }, groups: ['experience'] },
  { key: 'experience', label: { en: 'Experience', id: 'Pengalaman' }, groups: ['experience'] },
];

const OPP_CAT: Record<Opportunity['type'], { cat: UCat; hub: HubKey; groups: UFilter[] }> = {
  job: { cat: 'opportunity', hub: 'opportunities', groups: ['opportunity', 'career'] },
  internship: { cat: 'opportunity', hub: 'opportunities', groups: ['opportunity', 'career'] },
  course: { cat: 'course', hub: 'courses', groups: ['learning'] },
  mentor: { cat: 'mentor', hub: 'mentors', groups: ['people'] },
  event: { cat: 'event', hub: 'events', groups: ['opportunity', 'people'] },
  book: { cat: 'book', hub: 'books', groups: ['learning'] },
  research: { cat: 'research', hub: 'research', groups: ['learning'] },
};

const LIMIT: Partial<Record<HubKey, number>> = { opportunities: 6, courses: 4, mentors: 3, events: 3, books: 3, research: 2 };

export function buildUniverse(profile: Profile, quests: Quest[]) {
  const nodes: UNode[] = [];
  const edges: UEdge[] = [];
  const role = ROLE_BY_ID[profile.targetRole];
  const skills = skillProfile(profile);
  const gapSet = new Set(skills.filter((s) => s.isGap).map((s) => s.skill));
  const reqSet = new Set(skills.map((s) => s.skill));

  // Items per hub
  const items: Record<HubKey, Omit<UNode, 'x' | 'y' | 'order'>[]> = {
    role: [],
    skills: [],
    experience: [],
    projects: [],
    opportunities: [],
    courses: [],
    mentors: [],
    events: [],
    books: [],
    research: [],
  };

  items.role.push({ id: `role:${role.id}`, cat: 'role', hub: 'role', label: role.name, sub: { en: 'Your goal', id: 'Tujuanmu' }, refId: role.id, groups: ['career'] });

  for (const s of skills) {
    items.skills.push({
      id: `skill:${s.skill}`,
      cat: s.isGap ? 'gap' : 'skill',
      hub: 'skills',
      label: SKILL_BY_ID[s.skill].name,
      refId: s.skill,
      score: s.relevance,
      groups: s.isGap ? ['skills', 'gap'] : ['skills'],
    });
  }
  // A few strengths beyond the role's requirements
  Object.entries(profile.skills)
    .filter(([id, lv]) => !reqSet.has(id) && lv >= 3 && SKILL_BY_ID[id])
    .slice(0, 2)
    .forEach(([id]) => items.skills.push({ id: `skill:${id}`, cat: 'skill', hub: 'skills', label: SKILL_BY_ID[id].name, refId: id, groups: ['skills'] }));

  profile.experiences.forEach((e) => items.experience.push({ id: `exp:${e.id}`, cat: 'experience', hub: 'experience', label: e.title, sub: e.org, refId: e.id, groups: ['experience'] }));
  profile.projects.forEach((p) => items.projects.push({ id: `proj:${p.id}`, cat: 'project', hub: 'projects', label: p.title, refId: p.id, groups: ['experience'] }));

  const ranked = OPPORTUNITIES.map((o) => ({ o, m: matchOpportunity(o, profile, quests) })).sort((a, b) => b.m.score - a.m.score);
  for (const { o, m } of ranked) {
    const meta = OPP_CAT[o.type];
    const list = items[meta.hub];
    if (list.length >= (LIMIT[meta.hub] ?? 4)) continue;
    if (!o.roles.includes(role.id) && m.score < 70) continue;
    list.push({ id: `opp:${o.id}`, cat: meta.cat, hub: meta.hub, label: o.title, sub: o.type === 'mentor' ? o.meta : o.org, refId: o.id, score: m.score, groups: o.closesGap && gapSet.has(o.closesGap) ? [...meta.groups, 'gap'] : meta.groups });
  }

  // Layout: hubs on an inner ring, items fanned in a sector around their hub.
  const weights = HUBS.map((h) => Math.max(items[h.key].length, 1.6) + 1.2);
  const total = weights.reduce((a, b) => a + b, 0);
  const HUB_R = 270;
  let cursor = -Math.PI / 2 - (weights[0] / total) * Math.PI;
  let order = 1;
  nodes.push({ id: 'you', cat: 'you', label: profile.name.split(' ')[0], x: 0, y: 0, groups: ['all'], order: 0 });

  HUBS.forEach((h, hi) => {
    const sector = (weights[hi] / total) * Math.PI * 2;
    const mid = cursor + sector / 2;
    const hubId = `hub:${h.key}`;
    nodes.push({ id: hubId, cat: 'hub', hub: h.key, label: h.label, x: Math.cos(mid) * HUB_R, y: Math.sin(mid) * HUB_R, groups: h.groups, order: order++, count: items[h.key].length });
    edges.push({ id: `e:you:${hubId}`, source: 'you', target: hubId, kind: 'spoke' });
    const list = items[h.key];
    const n = list.length;
    list.forEach((it, i) => {
      const spread = sector * 0.84;
      const a = n === 1 ? mid : mid - spread / 2 + (spread * i) / (n - 1);
      const r = n > 4 ? (i % 2 === 0 ? 540 : 680) : 580;
      nodes.push({ ...it, x: Math.cos(a) * r, y: Math.sin(a) * r, order: order++ });
      edges.push({ id: `e:${hubId}:${it.id}`, source: hubId, target: it.id, kind: 'branch' });
    });
    cursor += sector;
  });

  // Cross links: what connects to which skill
  const skillIds = new Set(nodes.filter((n) => n.cat === 'skill' || n.cat === 'gap').map((n) => n.refId!));
  for (const n of nodes) {
    if (!n.refId) continue;
    if (n.id.startsWith('opp:')) {
      const o = OPPORTUNITIES.find((x) => x.id === n.refId)!;
      const targets = new Set<string>();
      if (o.closesGap && skillIds.has(o.closesGap)) targets.add(o.closesGap);
      o.skills.filter((s) => skillIds.has(s)).slice(0, 2).forEach((s) => targets.add(s));
      targets.forEach((s) => edges.push({ id: `l:${n.id}:${s}`, source: `skill:${s}`, target: n.id, kind: 'link' }));
    }
    if (n.id.startsWith('proj:')) {
      const p = profile.projects.find((x) => x.id === n.refId);
      p?.skills.filter((s) => skillIds.has(s)).forEach((s) => edges.push({ id: `l:${n.id}:${s}`, source: `skill:${s}`, target: n.id, kind: 'link' }));
    }
  }
  edges.push({ id: 'l:role:pa', source: `role:${role.id}`, target: `skill:${skills[0]?.skill}`, kind: 'link' });

  return { nodes, edges };
}

export function neighbours(id: string, edges: UEdge[]) {
  const set = new Set<string>([id]);
  for (const e of edges) {
    if (e.source === id) set.add(e.target);
    if (e.target === id) set.add(e.source);
  }
  return set;
}
