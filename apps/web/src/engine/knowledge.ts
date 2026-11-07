/**
 * Orbit Knowledge Engine — turns a learner's own materials (slides, notes, assignments, projects, links)
 * into skill evidence and learning recommendations.
 *
 * Everything runs on the device: the file is read in the browser, its text is analysed, and only the
 * analysis (skills, keywords, a short summary) is kept. The file itself is never stored or uploaded.
 */
import { ROLE_BY_ID } from '@/data/catalog';
import { COURSES, curriculumFor, type Course } from '@/data/courses';
import type { Material, MaterialKind, MaterialSkill, Profile, RoleId } from '@/data/types';
import { bestCourseFor } from './intelligence';

export const MAX_FILE_MB = 15;

export const KIND_LABEL: Record<MaterialKind, { en: string; id: string }> = {
  slides: { en: 'Slides', id: 'Slide' },
  notes: { en: 'Notes & readings', id: 'Catatan & bacaan' },
  assignment: { en: 'Assignment', id: 'Tugas' },
  project: { en: 'Project', id: 'Proyek' },
  link: { en: 'Link', id: 'Tautan' },
};
export const ACCEPT = '.pptx,.docx,.xlsx,.pdf,.txt,.md,.csv,.json,.ipynb,.html,.sql,.py,.js,.ts,.r';

/** Bilingual (EN/ID) vocabulary that signals each skill. Multi-word phrases are matched as phrases. */
const SKILL_TERMS: Record<string, string[]> = {
  'product-strategy': ['product strategy', 'roadmap', 'prioritization', 'prioritisation', 'prioritas', 'value proposition', 'product vision', 'go-to-market', 'north star', 'okr', 'strategi produk', 'product market fit', 'mvp'],
  'product-analytics': ['product analytics', 'funnel', 'retention', 'cohort', 'conversion', 'metric', 'metrics', 'kpi', 'dau', 'mau', 'churn', 'analitik produk', 'metrik', 'dashboard'],
  'prd-writing': ['prd', 'product requirement', 'user story', 'user stories', 'acceptance criteria', 'requirements', 'kebutuhan sistem', 'use case', 'spesifikasi', 'specification', 'srs'],
  agile: ['agile', 'scrum', 'sprint', 'kanban', 'backlog', 'retrospective', 'standup', 'stand-up', 'iterasi', 'iteration'],
  'ab-testing': ['a/b test', 'ab test', 'a/b testing', 'experiment', 'eksperimen', 'hypothesis', 'hipotesis', 'control group', 'treatment', 'significance', 'signifikan', 'p-value', 'uji hipotesis'],
  'user-research': ['user research', 'interview', 'wawancara', 'usability', 'persona', 'survey', 'survei', 'kuesioner', 'questionnaire', 'empathy', 'journey map', 'user testing', 'pengguna', 'responden'],
  'market-research': ['market research', 'riset pasar', 'competitor', 'kompetitor', 'market size', 'tam', 'segmentation', 'segmentasi', 'target market', 'pasar', 'swot', 'pesaing'],
  sql: ['sql', 'select', 'join', 'query', 'queries', 'database', 'basis data', 'mysql', 'postgres', 'postgresql', 'table', 'tabel', 'normalisasi', 'normalization', 'erd', 'primary key', 'group by'],
  'data-viz': ['visualization', 'visualisation', 'visualisasi', 'chart', 'grafik', 'tableau', 'power bi', 'looker', 'dashboard', 'plot', 'matplotlib', 'diagram batang', 'infographic'],
  excel: ['excel', 'spreadsheet', 'google sheets', 'pivot', 'vlookup', 'xlookup', 'formula', 'rumus', 'lembar kerja'],
  statistics: ['statistic', 'statistics', 'statistik', 'statistika', 'regression', 'regresi', 'probability', 'peluang', 'distribution', 'distribusi', 'variance', 'varians', 'mean', 'median', 'standard deviation', 'standar deviasi', 'correlation', 'korelasi', 'anova', 'sampling', 'sampel'],
  python: ['python', 'pandas', 'numpy', 'jupyter', 'notebook', 'scikit', 'sklearn', 'def ', 'import '],
  figma: ['figma', 'wireframe', 'mockup', 'mock-up', 'component', 'auto layout', 'frame'],
  prototyping: ['prototype', 'prototyping', 'prototipe', 'clickable', 'low-fidelity', 'high-fidelity', 'lo-fi', 'hi-fi'],
  'ui-design': ['ui design', 'user interface', 'antarmuka', 'typography', 'tipografi', 'layout', 'color palette', 'warna', 'design system', 'grid', 'visual hierarchy', 'nirmana'],
  javascript: ['javascript', 'typescript', 'node', 'npm', 'function', 'const ', 'html', 'css', 'dom'],
  react: ['react', 'jsx', 'component', 'hooks', 'useState', 'next.js', 'vue', 'frontend'],
  git: ['git', 'github', 'gitlab', 'commit', 'pull request', 'branch', 'merge', 'repository', 'repositori'],
  apis: ['api', 'rest', 'endpoint', 'backend', 'server', 'http', 'json', 'microservice', 'laravel', 'express', 'framework'],
  seo: ['seo', 'search engine', 'keyword', 'kata kunci', 'backlink', 'ranking', 'serp', 'organic'],
  content: ['content', 'konten', 'copywriting', 'social media', 'media sosial', 'instagram', 'tiktok', 'campaign', 'kampanye', 'blog', 'newsletter', 'engagement'],
  communication: ['communication', 'komunikasi', 'presentation', 'presentasi', 'writing', 'menulis', 'report', 'laporan', 'essay', 'esai', 'english', 'bahasa inggris'],
  stakeholder: ['stakeholder', 'pemangku kepentingan', 'client', 'klien', 'negotiation', 'negosiasi', 'alignment', 'project charter', 'risk', 'risiko'],
  leadership: ['leadership', 'kepemimpinan', 'lead', 'team', 'tim', 'organisasi', 'organization', 'ketua', 'koordinator', 'committee', 'panitia', 'delegasi'],
  'public-speaking': ['public speaking', 'pitch', 'presentasi', 'presentation', 'speech', 'pidato', 'seminar', 'debat', 'debate'],
  'problem-solving': ['problem solving', 'pemecahan masalah', 'algorithm', 'algoritma', 'optimization', 'optimasi', 'case study', 'studi kasus', 'logic', 'logika', 'analysis', 'analisis', 'root cause'],
  storytelling: ['storytelling', 'story', 'cerita', 'narrative', 'narasi', 'case study', 'portfolio', 'portofolio', 'insight'],
};

const STOP = new Set(
  'that this with from have will your about which their there these those into when what then than them they been were also more most such only over very some each other after before while where because would could should using used make made just like dalam yang untuk dengan pada adalah dari atau akan juga oleh karena sebagai bahwa dapat lebih tidak sudah masih antara setiap hanya secara serta para kami kita mereka anda saya ini itu tersebut sangat bisa harus agar maka jika namun telah sedang ketika lain seperti hal slide page halaman nama kelompok tugas week minggu pertemuan bab chapter pptx docx xlsx ipynb html final copy draft untitled'.split(
    ' ',
  ),
);

// ───────────────────────────── Text extraction

async function inflate(data: Uint8Array, format: 'deflate' | 'deflate-raw') {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const utf8 = new TextDecoder('utf-8');
const latin1 = (u8: Uint8Array) => {
  let s = '';
  for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode(...u8.subarray(i, i + 8192));
  return s;
};

/** Minimal ZIP reader (Office files are ZIP archives). Returns decoded entries whose names pass `keep`. */
async function unzip(buf: ArrayBuffer, keep: (name: string) => boolean) {
  const dv = new DataView(buf);
  const u8 = new Uint8Array(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65_557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('not a zip');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const out: { name: string; text: string }[] = [];
  for (let n = 0; n < count && p + 46 <= u8.length; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const name = utf8.decode(u8.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (!keep(name)) continue;
    const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
    const data = u8.subarray(start, start + csize);
    try {
      const bytes = method === 0 ? data : method === 8 ? await inflate(data, 'deflate-raw') : null;
      if (bytes) out.push({ name, text: utf8.decode(bytes) });
    } catch {
      // skip unreadable entries
    }
  }
  return out;
}

const decodeXml = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&');

/** Text runs (`<a:t>`, `<w:t>`, `<t>`) with paragraph breaks preserved. */
function xmlText(xml: string, tag: string, para: string) {
  return decodeXml(
    xml
      .replace(new RegExp(`</${para}>`, 'g'), '\n')
      .replace(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)</${tag}>`, 'g'), '$1 ')
      .replace(/<[^>]+>/g, ''),
  );
}

const num = (s: string) => Number(s.match(/(\d+)\.xml$/)?.[1] ?? 0);

/** Best-effort text from uncompressed or Flate-compressed PDF content streams. */
async function pdfText(buf: ArrayBuffer) {
  const u8 = new Uint8Array(buf);
  const s = latin1(u8);
  const chunks: string[] = [];
  const re = /stream\r?\n/g;
  let m: RegExpExecArray | null;
  let seen = 0;
  while ((m = re.exec(s)) && seen < 400) {
    seen++;
    const start = m.index + m[0].length;
    const dict = s.slice(Math.max(0, m.index - 400), m.index);
    const len = dict.match(/\/Length\s+(\d+)(?!\s+\d+\s+R)/);
    let end = len ? start + Number(len[1]) : s.indexOf('endstream', start);
    if (end < start) continue;
    if (!len) while (end > start && (u8[end - 1] === 10 || u8[end - 1] === 13)) end--;
    let content: string;
    if (/\/FlateDecode/.test(dict)) {
      try {
        content = latin1(await inflate(u8.subarray(start, end), 'deflate'));
      } catch {
        continue;
      }
    } else if (!/\/Filter/.test(dict)) content = s.slice(start, end);
    else continue;
    if (!/T[Jj]/.test(content)) continue;
    const strs = content.match(/\((?:\\.|[^\\)])*\)/g) ?? [];
    chunks.push(
      strs
        .map((x) =>
          x
            .slice(1, -1)
            .replace(/\\([nrt])/g, ' ')
            .replace(/\\(\d{3})/g, (_, o: string) => String.fromCharCode(parseInt(o, 8)))
            .replace(/\\(.)/g, '$1'),
        )
        .join(''),
    );
    re.lastIndex = end;
  }
  // Keep only readable runs — custom font encodings produce noise we can't decode.
  return chunks
    .join('\n')
    .replace(/[^\x20-\x7EÀ-ɏ\n]+/g, ' ')
    .replace(/\b\w{1}\b/g, ' ');
}

export interface Extracted {
  text: string;
  /** How the text was read — shown to the learner so the analysis stays transparent. */
  method: 'slides' | 'document' | 'spreadsheet' | 'pdf' | 'notebook' | 'text' | 'name-only';
}

export function extOf(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export async function extractText(file: File): Promise<Extracted> {
  const ext = extOf(file.name);
  const zipOk = typeof DecompressionStream !== 'undefined';
  try {
    if (ext === 'pptx' && zipOk) {
      const files = await unzip(await file.arrayBuffer(), (n) => /^ppt\/(slides\/slide|notesSlides\/notesSlide)\d+\.xml$/.test(n));
      files.sort((a, b) => Number(a.name.includes('notes')) - Number(b.name.includes('notes')) || num(a.name) - num(b.name));
      return { text: files.map((f) => xmlText(f.text, 'a:t', 'a:p')).join('\n'), method: 'slides' };
    }
    if (ext === 'docx' && zipOk) {
      const files = await unzip(await file.arrayBuffer(), (n) => n === 'word/document.xml');
      return { text: files.map((f) => xmlText(f.text, 'w:t', 'w:p')).join('\n'), method: 'document' };
    }
    if (ext === 'xlsx' && zipOk) {
      const files = await unzip(await file.arrayBuffer(), (n) => n === 'xl/sharedStrings.xml');
      return { text: files.map((f) => xmlText(f.text, 't', 'si')).join('\n'), method: 'spreadsheet' };
    }
    if (ext === 'pdf' && zipOk) return { text: await pdfText(await file.arrayBuffer()), method: 'pdf' };
    if (ext === 'ipynb') {
      const nb = JSON.parse(await file.text()) as { cells?: { source?: string | string[] }[] };
      return { text: (nb.cells ?? []).map((c) => (Array.isArray(c.source) ? c.source.join('') : c.source ?? '')).join('\n'), method: 'notebook' };
    }
    if (['txt', 'md', 'csv', 'json', 'html', 'sql', 'py', 'js', 'ts', 'r'].includes(ext)) {
      const raw = await file.text();
      return { text: ext === 'html' ? raw.replace(/<[^>]+>/g, ' ') : raw, method: 'text' };
    }
  } catch {
    // fall through to name-only analysis
  }
  return { text: '', method: 'name-only' };
}

// ───────────────────────────── Analysis

function countTerm(hay: string, term: string) {
  const t = term.toLowerCase();
  if (/^[a-z0-9]+$/.test(t)) {
    const m = hay.match(new RegExp(`\\b${t}\\b`, 'g'));
    return m ? m.length : 0;
  }
  let c = 0;
  let i = hay.indexOf(t);
  while (i >= 0 && c < 50) {
    c++;
    i = hay.indexOf(t, i + t.length);
  }
  return c;
}

const courseNames = (c: Course) => [typeof c.name === 'string' ? c.name : c.name.en, typeof c.name === 'string' ? c.name : c.name.id].map((s) => s.toLowerCase().replace(/\s*\(.*\)$/, ''));

export interface AnalysisInput {
  title: string;
  text: string;
  note?: string;
  url?: string;
  kind: MaterialKind;
  courseId?: string;
  major: string;
}

export interface Analysis {
  skills: MaterialSkill[];
  keywords: string[];
  summary: string;
  words: number;
  courseId?: string;
  /** True when the course was suggested by Orbit rather than chosen by the learner. */
  courseSuggested: boolean;
}

export function analyzeMaterial(input: AnalysisInput): Analysis {
  const body = input.text.slice(0, 200_000).toLowerCase();
  const title = `${input.title} ${input.url ?? ''}`.toLowerCase().replace(/[_\-./]+/g, ' ');
  const note = (input.note ?? '').toLowerCase();
  const words = input.text.split(/\s+/).filter(Boolean).length;

  // Skill evidence: the title and the learner's note weigh more than the body.
  const raw: Record<string, number> = {};
  for (const [skill, terms] of Object.entries(SKILL_TERMS)) {
    let n = 0;
    for (const term of terms) n += countTerm(title, term) * 3 + countTerm(note, term) * 2 + Math.min(countTerm(body, term), 12);
    if (n > 0) raw[skill] = n;
  }

  // Course: the learner's choice, else the best match by name and skill overlap.
  const curriculum = curriculumFor(input.major);
  let courseId = input.courseId;
  let courseSuggested = false;
  if (!courseId) {
    let best: { id: string; s: number } | null = null;
    for (const c of curriculum) {
      const nameHits = courseNames(c).reduce((s, n) => s + (title.includes(n) ? 6 : 0) + (note.includes(n) ? 4 : 0) + Math.min(countTerm(body, n), 3), 0);
      const overlap = c.skills.reduce((s, cs) => s + (raw[cs.skill] ? Math.min(raw[cs.skill], 6) * cs.weight * 0.25 : 0), 0);
      const s = nameHits + overlap;
      if (s >= 4 && (!best || s > best.s)) best = { id: c.id, s };
    }
    if (best) {
      courseId = best.id;
      courseSuggested = true;
    }
  }
  // A linked class lends weak evidence for the skills it trains.
  const course = courseId ? COURSES.find((c) => c.id === courseId) : undefined;
  if (course) for (const cs of course.skills) raw[cs.skill] = (raw[cs.skill] ?? 0) + cs.weight * 0.6;

  const skills = Object.entries(raw)
    .map(([skill, n]) => ({ skill, score: Math.min(97, Math.round(30 + 18 * Math.log2(1 + n))) }))
    .filter((s) => s.score >= 42)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Keywords: subject terms Orbit recognised first, then other frequent meaningful words.
  const all = `${title} ${note} ${body}`;
  const subject = new Map<string, number>();
  for (const terms of Object.values(SKILL_TERMS))
    for (const term of terms) {
      const k = term.trim().toLowerCase();
      if (k.length < 3 || subject.has(k)) continue;
      const n = countTerm(all, k);
      if (n > 0) subject.set(k, n);
    }
  const freq = new Map<string, number>();
  for (const w of all.match(/[a-zà-ÿ][a-zà-ÿ0-9/+-]{3,}/g) ?? []) {
    if (STOP.has(w) || /^\d/.test(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const keywords = [
    ...[...subject.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w),
    ...[...freq.entries()]
      .filter(([, n]) => n >= Math.max(2, Math.ceil(words / 400)))
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w),
  ]
    .filter((w, i, arr) => !arr.slice(0, i).some((o) => o === w || o.includes(w) || w.includes(o)))
    .slice(0, 8);

  // Summary: first readable sentences.
  const sentences = input.text
    .split(/\n+/)
    .flatMap((line) => line.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 6 && /[a-zA-Z]{3}/.test(s));
  // Prefer full sentences over headings; fall back to lines for unpunctuated text (e.g. PDFs).
  const full = sentences.filter((s) => /[.!?]$/.test(s));
  let summary = (full.length ? full : sentences).slice(0, 2).join(' ');
  if (!summary) summary = input.note?.trim() || '';
  if (summary.length > 260) summary = `${summary.slice(0, 257).trimEnd()}…`;

  return { skills, keywords, summary, words, courseId, courseSuggested };
}

/** How much of a material feeds a role, 0–100 (same idea as class relevance). */
export function materialRelevance(m: Pick<Material, 'skills'>, roleId: RoleId) {
  const reqs = ROLE_BY_ID[roleId].requirements;
  let covered = 0;
  let total = 0;
  for (const s of m.skills) {
    const w = s.score / 100;
    total += w;
    const r = reqs.find((x) => x.skill === s.skill);
    if (r) covered += w * (0.55 + 0.15 * r.weight);
  }
  return total ? Math.round((covered / total) * 100) : 0;
}

export interface CoverageRow {
  skill: string;
  weight: number;
  target: number;
  level: number;
  /** Materials that show evidence of this skill. */
  materials: number;
  strength: number;
  covered: boolean;
  isGap: boolean;
}

/** The role's required skills, read against the evidence in the learner's materials. */
export function vaultCoverage(materials: Material[], profile: Profile): CoverageRow[] {
  const role = ROLE_BY_ID[profile.targetRole];
  return role.requirements
    .map((r) => {
      const hits = materials.map((m) => m.skills.find((s) => s.skill === r.skill)?.score ?? 0).filter((x) => x > 0);
      const strength = hits.length ? Math.max(...hits) : 0;
      const level = profile.skills[r.skill] ?? 0;
      return { skill: r.skill, weight: r.weight, target: r.target, level, materials: hits.length, strength, covered: strength >= 55, isGap: level < r.target };
    })
    .sort((a, b) => Number(a.covered) - Number(b.covered) || b.weight - a.weight);
}

export interface StudyPick {
  skill: string;
  reason: 'uncovered-gap' | 'weak-evidence';
  /** A class in the learner's own curriculum that trains it. */
  courseId?: string;
  /** An Orbit course/opportunity that closes it. */
  oppId?: string;
}

/** The best next things to study: gaps with no evidence first, then weak evidence — mapped to a class and a course. */
export function studyPicks(materials: Material[], profile: Profile, limit = 3): StudyPick[] {
  const curriculum = curriculumFor(profile.major);
  return vaultCoverage(materials, profile)
    .filter((r) => r.isGap && !r.covered)
    .slice(0, limit)
    .map((r) => {
      const cls = curriculum
        .filter((c) => c.skills.some((s) => s.skill === r.skill))
        .sort((a, b) => (b.skills.find((s) => s.skill === r.skill)?.weight ?? 0) - (a.skills.find((s) => s.skill === r.skill)?.weight ?? 0))[0];
      return { skill: r.skill, reason: r.materials ? 'weak-evidence' : 'uncovered-gap', courseId: cls?.id, oppId: bestCourseFor(r.skill, profile.targetRole)?.id };
    });
}

/** A ready-to-try sample so learners can see the analysis without hunting for a file. */
export function sampleMaterial(lang: 'en' | 'id'): File {
  const text =
    lang === 'id'
      ? `Statistika — Pertemuan 9: Uji Hipotesis dan A/B Testing
Uji hipotesis membantu kita memutuskan apakah perbedaan antara dua kelompok signifikan atau hanya kebetulan.
Dalam produk digital, A/B testing membandingkan conversion rate antara control group dan treatment.
Langkah: tentukan hipotesis nol, pilih metrik utama (misalnya retention atau conversion), hitung p-value, lalu ambil keputusan.
Tugas: analisis dataset eksperimen tombol checkout. Gunakan Excel atau Python (pandas) untuk menghitung mean, standar deviasi, dan signifikansi.
Presentasikan insight dalam dashboard sederhana dengan grafik yang jelas.`
      : `Statistics — Week 9: Hypothesis Testing and A/B Testing
Hypothesis testing helps us decide whether a difference between two groups is significant or just chance.
In digital products, an A/B test compares the conversion rate of a control group and a treatment.
Steps: define the null hypothesis, choose a primary metric (for example retention or conversion), compute the p-value, then decide.
Assignment: analyse the checkout-button experiment dataset. Use Excel or Python (pandas) to compute the mean, standard deviation and significance.
Present the insight in a simple dashboard with clear charts.`;
  return new File([text], lang === 'id' ? 'Statistika - Uji Hipotesis & AB Testing.md' : 'Statistics - Hypothesis Testing & AB Testing.md', { type: 'text/markdown' });
}
