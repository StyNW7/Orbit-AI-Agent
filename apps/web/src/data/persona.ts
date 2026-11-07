import type { Activity, JournalEntry, Mission, OrbitNotification, Profile, Reminder, SavedItem } from './types';

const iso = (daysAgo: number, hour = 9) => {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  d.setHours(hour, (daysAgo * 17) % 60, 0, 0);
  return d.toISOString();
};
const date = (inDays: number) => new Date(Date.now() + inDays * 86_400_000).toISOString().slice(0, 10);

export const NAYA: Profile = {
  name: 'Naya Prameswari',
  email: 'naya.prameswari@mail.com',
  headline: 'Final-year Information Systems student · aspiring Product Manager',
  university: 'Universitas Cakrawala',
  major: 'Information Systems',
  semester: 7,
  gpa: 3.62,
  targetRole: 'product-manager',
  skills: {
    'product-strategy': 2,
    'product-analytics': 2,
    sql: 1,
    'user-research': 3,
    communication: 3,
    stakeholder: 2,
    'prd-writing': 3,
    agile: 2,
    'ab-testing': 1,
    leadership: 3,
    figma: 2,
    excel: 3,
    'public-speaking': 2,
    'problem-solving': 3,
    'data-viz': 2,
  },
  experiences: [
    { id: 'e1', title: 'Product Intern', org: 'Kedai Digital', kind: 'internship', period: 'Jun – Aug 2026', highlight: 'Shipped a reorder shortcut used by 18% of weekly buyers.' },
    { id: 'e2', title: 'Head of Programs', org: 'Student Executive Board', kind: 'organization', period: '2025 – 2026', highlight: 'Led 14 people running 9 programs for 2,000+ students.' },
    { id: 'e3', title: 'Lead Organizer', org: 'Campus Tech Week', kind: 'organization', period: '2025', highlight: 'Grew attendance 40% with a new speaker format.' },
  ],
  projects: [
    { id: 'p1', title: 'Campus Food Pre-order', description: 'PRD and clickable prototype for skipping canteen queues.', skills: ['prd-writing', 'user-research', 'figma'] },
    { id: 'p2', title: 'Library Seat Finder', description: 'UX case study from 12 student interviews.', skills: ['user-research', 'figma'] },
    { id: 'p3', title: 'Student Survey Dashboard', description: 'Spreadsheet dashboard for 1,400 survey responses.', skills: ['excel', 'data-viz'] },
    { id: 'p4', title: 'SME Inventory Assistant', description: 'Hackathon prototype — top 5 of 38 teams.', skills: ['product-strategy', 'communication'] },
  ],
  portfolioUrl: 'naya-prameswari.notion.site',
  portfolioArtifacts: 2,
  interviewConfidence: 3,
  mockInterviews: 2,
  interests: ['Fintech', 'Edtech', 'E-commerce'],
  avatarHue: 152,
};

export function seedMissions(): Mission[] {
  return [
    { id: 'm1', title: { en: 'Review your weekly plan', id: 'Tinjau rencana mingguan' }, minutes: 5, done: true, xp: 20, to: '/app/journey' },
    { id: 'm2', title: { en: 'Read one chapter of “Inspired”', id: 'Baca satu bab “Inspired”' }, minutes: 25, done: true, xp: 30, to: '/app/journey' },
    { id: 'm3', title: { en: 'Write success metrics for your case study', id: 'Tulis metrik keberhasilan studi kasus' }, minutes: 30, done: false, xp: 40, to: '/app/journey' },
    { id: 'm4', title: { en: 'Send an intro message to Dimas Pratama', id: 'Kirim pesan perkenalan ke Dimas Pratama' }, minutes: 10, done: false, xp: 30, to: '/app/discover?type=mentor' },
  ];
}

export function seedSaved(): Record<string, SavedItem> {
  return {
    'int-pm-lumen': { oppId: 'int-pm-lumen', status: 'saved', savedAt: iso(3), updatedAt: iso(3) },
    'job-jpo-kopikita': { oppId: 'job-jpo-kopikita', status: 'applied', savedAt: iso(9), updatedAt: iso(6), note: 'Referral from Raka.' },
    'course-interview': { oppId: 'course-interview', status: 'saved', savedAt: iso(5), updatedAt: iso(5) },
  };
}

export function seedReminders(): Reminder[] {
  return [
    { id: 'r1', title: 'Product Talk: Metrics that Matter', date: date(4), time: '19:00', oppId: 'event-metrics-talk', done: false, createdAt: iso(2) },
    { id: 'r2', title: 'Send case study draft to Raka', date: date(2), time: '10:00', done: false, createdAt: iso(1) },
  ];
}

export function seedNotifications(): OrbitNotification[] {
  return [
    {
      id: 'n1',
      kind: 'deadline',
      title: { en: 'Product Analyst Internship closes in 9 days', id: 'Product Analyst Internship tutup 9 hari lagi' },
      body: { en: 'Sagara Pay · strong match for your Product Analytics goal.', id: 'Sagara Pay · sangat cocok dengan tujuan Product Analytics-mu.' },
      createdAt: iso(0, 8),
      read: false,
      oppId: 'int-pa-sagara',
    },
    {
      id: 'n2',
      kind: 'opportunity',
      title: { en: 'New match: Associate Product Manager', id: 'Match baru: Associate Product Manager' },
      body: { en: 'Sagara Pay posted a graduate APM program that fits your target.', id: 'Sagara Pay membuka program APM yang sesuai targetmu.' },
      createdAt: iso(1, 16),
      read: false,
      oppId: 'job-apm-sagara',
    },
    {
      id: 'n3',
      kind: 'mentor',
      title: { en: 'Raka Wibisono opened mock interview slots', id: 'Raka Wibisono membuka slot mock interview' },
      body: { en: 'Friday, 16:00 – 18:00. Good timing for your Interview Readiness gap.', id: 'Jumat, 16.00 – 18.00. Waktu yang pas untuk gap Interview Readiness-mu.' },
      createdAt: iso(1, 11),
      read: false,
      oppId: 'mentor-raka',
    },
    {
      id: 'n4',
      kind: 'review',
      title: { en: 'Your weekly review is ready', id: 'Weekly review-mu sudah siap' },
      body: { en: 'You completed 3 quests and gained +2.1% readiness last week.', id: 'Kamu menyelesaikan 3 quest dan naik +2,1% kesiapan minggu lalu.' },
      createdAt: iso(2, 9),
      read: true,
      to: '/app/progress',
    },
    {
      id: 'n5',
      kind: 'course',
      title: { en: 'Keep going with “Inspired”', id: 'Lanjutkan membaca “Inspired”' },
      body: { en: 'You are halfway through. One more chapter today keeps your streak.', id: 'Kamu sudah setengah jalan. Satu bab lagi hari ini menjaga streak-mu.' },
      createdAt: iso(3, 18),
      read: true,
      to: '/app/journey',
    },
    {
      id: 'n6',
      kind: 'achievement',
      title: { en: 'Achievement unlocked: Skill Builder', id: 'Achievement terbuka: Skill Builder' },
      body: { en: 'You reached Advanced in three skills.', id: 'Kamu mencapai level Mahir di tiga skill.' },
      createdAt: iso(6, 14),
      read: true,
      to: '/app/progress',
    },
  ];
}

export function seedJournal(): JournalEntry[] {
  return [
    {
      id: 'j1',
      title: 'What I learned from the Kedai Digital internship',
      body: 'The reorder shortcut worked because we watched real buyers first. Next time I want to define the success metric before building — I only measured adoption after launch.',
      tags: ['reflection', 'learning'],
      pinned: true,
      mood: 'great',
      createdAt: iso(12, 20),
      updatedAt: iso(12, 20),
    },
    {
      id: 'j2',
      title: 'Kopi Kita first-round interview notes',
      body: 'They asked how I would prioritise three feature requests. I used impact vs effort but forgot to mention data. Practise: “how would you measure success?” for every answer.',
      tags: ['interview'],
      pinned: false,
      mood: 'okay',
      createdAt: iso(6, 19),
      updatedAt: iso(6, 19),
    },
    {
      id: 'j3',
      title: 'Coffee chat with Raka',
      body: 'Advice: a strong case study beats five certificates. Show trade-offs and what you would do differently. He offered to review my deck next week.',
      tags: ['mentorship'],
      pinned: false,
      mood: 'good',
      createdAt: iso(4, 17),
      updatedAt: iso(4, 17),
    },
    {
      id: 'j4',
      title: 'Choosing Product over Data Analyst',
      body: 'I enjoy the data part, but I get the most energy from talking to users and deciding what to build. Product Analytics can be my edge as a PM.',
      tags: ['decision', 'reflection'],
      pinned: false,
      mood: 'great',
      createdAt: iso(30, 21),
      updatedAt: iso(30, 21),
    },
  ];
}

export function seedActivity(): Activity[] {
  return [
    { id: 'a1', kind: 'quest', title: { en: 'Finished Part II of “Inspired”', id: 'Menyelesaikan Bagian II “Inspired”' }, at: iso(1, 21), xp: 30 },
    { id: 'a2', kind: 'save', title: { en: 'Saved Product Management Internship', id: 'Menyimpan Product Management Internship' }, detail: 'Lumen Commerce', at: iso(3, 10) },
    { id: 'a3', kind: 'skill', title: { en: 'Leadership reached Advanced', id: 'Kepemimpinan mencapai level Mahir' }, at: iso(5, 15), readiness: 0.9 },
    { id: 'a4', kind: 'apply', title: { en: 'Applied to Junior Product Owner', id: 'Melamar Junior Product Owner' }, detail: 'Kopi Kita Digital', at: iso(6, 11), xp: 60 },
    { id: 'a5', kind: 'achievement', title: { en: 'Unlocked “Skill Builder”', id: 'Membuka “Skill Builder”' }, at: iso(6, 14) },
    { id: 'a6', kind: 'quest', title: { en: 'Updated CV for product roles', id: 'Memperbarui CV untuk peran produk' }, at: iso(20, 13), xp: 120, readiness: 1.2 },
    { id: 'a7', kind: 'journey', title: { en: 'Started the Product Manager Career Path', id: 'Memulai Product Manager Career Path' }, at: iso(36, 9) },
  ];
}

/** Readiness over the past ten months — values before Orbit's baseline. */
export const NAYA_HISTORY = [52, 55, 59, 66, 66, 67, 67, 68, 68, 73];
export const NAYA_30D_AGO = 67.8;

/** Naya's Knowledge Vault — materials from her classes and projects, already analysed. */
export function seedMaterials(): import('./types').Material[] {
  return [
    {
      id: 'mat-stats',
      title: 'Statistika – Uji Hipotesis (Pertemuan 9)',
      kind: 'slides',
      source: 'file',
      fileName: 'Statistika_Pertemuan9_UjiHipotesis.pptx',
      ext: 'pptx',
      size: 2_480_000,
      courseId: 'statistics',
      skills: [{ skill: 'statistics', score: 92 }, { skill: 'product-analytics', score: 63 }, { skill: 'ab-testing', score: 52 }, { skill: 'excel', score: 47 }],
      keywords: ['hipotesis', 'p-value', 'signifikansi', 'distribusi', 'sampel', 'conversion'],
      summary: 'Hypothesis testing decides whether a difference between two groups is significant or chance. Covers null hypotheses, p-values and a worked conversion example.',
      words: 1840,
      addedAt: iso(21, 20),
    },
    {
      id: 'mat-sql',
      title: 'Tugas Basis Data – Query Funnel E-commerce',
      kind: 'assignment',
      source: 'file',
      fileName: 'tugas3_query_funnel.sql',
      ext: 'sql',
      size: 14_200,
      courseId: 'database',
      skills: [{ skill: 'sql', score: 94 }, { skill: 'product-analytics', score: 71 }, { skill: 'problem-solving', score: 52 }],
      keywords: ['select', 'join', 'group', 'funnel', 'checkout', 'orders'],
      summary: 'Five queries that trace visitors from product view to checkout and compute the drop-off at each step.',
      words: 620,
      addedAt: iso(15, 19),
    },
    {
      id: 'mat-prd',
      title: 'PRD – Campus Food Pre-order',
      kind: 'project',
      source: 'file',
      fileName: 'PRD_CampusFoodPreorder_v2.docx',
      ext: 'docx',
      size: 412_000,
      courseId: 'system-analysis',
      skills: [{ skill: 'prd-writing', score: 93 }, { skill: 'user-research', score: 78 }, { skill: 'product-strategy', score: 66 }, { skill: 'stakeholder', score: 50 }],
      keywords: ['user story', 'acceptance', 'canteen', 'queue', 'metrics', 'persona'],
      summary: 'Requirements for letting students pre-order canteen food: personas, user stories, acceptance criteria and launch metrics.',
      words: 3120,
      addedAt: iso(11, 21),
    },
    {
      id: 'mat-hci',
      title: 'Library Seat Finder – Usability Report',
      kind: 'project',
      source: 'file',
      fileName: 'IMK_LibrarySeatFinder_Report.pdf',
      ext: 'pdf',
      size: 3_900_000,
      courseId: 'hci',
      skills: [{ skill: 'user-research', score: 91 }, { skill: 'prototyping', score: 70 }, { skill: 'figma', score: 62 }],
      keywords: ['usability', 'interview', 'prototype', 'task', 'findings'],
      summary: 'Findings from 12 student interviews and five usability tests, with a redesigned seat-finder prototype.',
      words: 2760,
      addedAt: iso(8, 18),
    },
    {
      id: 'mat-pitch',
      title: 'Komunikasi Bisnis – Hackathon Pitch Deck',
      kind: 'slides',
      source: 'file',
      fileName: 'Pitch_SME_Inventory.pptx',
      ext: 'pptx',
      size: 5_100_000,
      courseId: 'biz-comm',
      skills: [{ skill: 'public-speaking', score: 85 }, { skill: 'storytelling', score: 74 }, { skill: 'communication', score: 70 }],
      keywords: ['pitch', 'problem', 'solution', 'market', 'demo'],
      summary: 'Ten-slide pitch for the SME Inventory Assistant that placed top 5 of 38 teams.',
      words: 540,
      addedAt: iso(5, 22),
    },
    {
      id: 'mat-notion',
      title: 'Product teardown notes',
      kind: 'link',
      source: 'link',
      url: 'https://naya-prameswari.notion.site/teardowns',
      courseId: 'product-elective',
      note: 'Weekly teardowns of apps I use — users, key metric, one feature I would build.',
      skills: [{ skill: 'product-strategy', score: 81 }, { skill: 'product-analytics', score: 58 }, { skill: 'storytelling', score: 50 }],
      keywords: ['teardown', 'metric', 'feature', 'users'],
      summary: 'Weekly teardowns of apps I use — users, key metric, one feature I would build.',
      words: 0,
      addedAt: iso(2, 20),
    },
  ];
}
