import type { Level, Role, RoleId, Skill, SkillCategory } from './types';
import type { Text } from '@/lib/i18n';

export const SKILLS: Skill[] = [
  // Product
  { id: 'product-strategy', name: 'Product Strategy', category: 'product', description: { en: 'Turning user and business goals into a focused roadmap.', id: 'Menerjemahkan tujuan pengguna dan bisnis menjadi roadmap yang fokus.' } },
  { id: 'product-analytics', name: 'Product Analytics', category: 'data', description: { en: 'Defining metrics, reading funnels and making decisions from product data.', id: 'Menentukan metrik, membaca funnel, dan mengambil keputusan dari data produk.' } },
  { id: 'prd-writing', name: { en: 'Product Documentation', id: 'Dokumentasi Produk' }, category: 'product', description: { en: 'Writing clear PRDs, user stories and acceptance criteria.', id: 'Menulis PRD, user story, dan acceptance criteria yang jelas.' } },
  { id: 'agile', name: 'Agile & Scrum', category: 'product', description: { en: 'Running sprints, backlogs and rituals with a delivery team.', id: 'Menjalankan sprint, backlog, dan ritual bersama tim delivery.' } },
  { id: 'ab-testing', name: 'A/B Testing', category: 'data', description: { en: 'Designing experiments and interpreting results with confidence.', id: 'Merancang eksperimen dan menafsirkan hasilnya dengan percaya diri.' } },
  { id: 'user-research', name: 'User Research', category: 'design', description: { en: 'Interviews, usability tests and turning insight into decisions.', id: 'Wawancara, uji usability, dan mengubah insight menjadi keputusan.' } },
  { id: 'market-research', name: { en: 'Market Research', id: 'Riset Pasar' }, category: 'marketing', description: { en: 'Sizing markets and understanding competitors.', id: 'Mengukur pasar dan memahami kompetitor.' } },
  // Data
  { id: 'sql', name: 'SQL', category: 'data', description: { en: 'Querying and joining data to answer product questions.', id: 'Melakukan query dan join data untuk menjawab pertanyaan produk.' } },
  { id: 'data-viz', name: { en: 'Data Visualization', id: 'Visualisasi Data' }, category: 'data', description: { en: 'Dashboards and charts that make data easy to act on.', id: 'Dashboard dan grafik yang membuat data mudah ditindaklanjuti.' } },
  { id: 'excel', name: 'Excel & Sheets', category: 'data', description: { en: 'Modelling, pivots and quick analysis in spreadsheets.', id: 'Pemodelan, pivot, dan analisis cepat di spreadsheet.' } },
  { id: 'statistics', name: { en: 'Statistics', id: 'Statistika' }, category: 'data', description: { en: 'Distributions, significance and sound reasoning with numbers.', id: 'Distribusi, signifikansi, dan penalaran yang tepat dengan angka.' } },
  { id: 'python', name: 'Python', category: 'engineering', description: { en: 'Scripting and analysis with pandas and notebooks.', id: 'Scripting dan analisis dengan pandas dan notebook.' } },
  // Design
  { id: 'figma', name: 'Figma', category: 'design', description: { en: 'Wireframes, components and high-fidelity prototypes.', id: 'Wireframe, komponen, dan prototipe high-fidelity.' } },
  { id: 'prototyping', name: { en: 'Prototyping', id: 'Prototyping' }, category: 'design', description: { en: 'Testing ideas quickly with interactive prototypes.', id: 'Menguji ide dengan cepat melalui prototipe interaktif.' } },
  { id: 'ui-design', name: 'UI Design', category: 'design', description: { en: 'Visual hierarchy, layout and design systems.', id: 'Hierarki visual, layout, dan design system.' } },
  // Engineering
  { id: 'javascript', name: 'JavaScript', category: 'engineering', description: { en: 'Modern JavaScript for the web.', id: 'JavaScript modern untuk web.' } },
  { id: 'react', name: 'React', category: 'engineering', description: { en: 'Building component-driven interfaces.', id: 'Membangun antarmuka berbasis komponen.' } },
  { id: 'git', name: { en: 'Git & Collaboration', id: 'Git & Kolaborasi' }, category: 'engineering', description: { en: 'Branching, reviews and shipping as a team.', id: 'Branching, review, dan rilis bersama tim.' } },
  { id: 'apis', name: { en: 'APIs & Backend', id: 'API & Backend' }, category: 'engineering', description: { en: 'Designing and consuming services.', id: 'Merancang dan menggunakan layanan.' } },
  // Marketing
  { id: 'seo', name: 'SEO', category: 'marketing', description: { en: 'Search visibility and content structure.', id: 'Visibilitas pencarian dan struktur konten.' } },
  { id: 'content', name: { en: 'Content Marketing', id: 'Content Marketing' }, category: 'marketing', description: { en: 'Planning content that grows an audience.', id: 'Merencanakan konten yang menumbuhkan audiens.' } },
  // Human
  { id: 'communication', name: { en: 'Communication', id: 'Komunikasi' }, category: 'human', description: { en: 'Explaining ideas clearly in writing and in person.', id: 'Menjelaskan ide dengan jelas secara tertulis maupun lisan.' } },
  { id: 'stakeholder', name: { en: 'Stakeholder Management', id: 'Manajemen Stakeholder' }, category: 'human', description: { en: 'Aligning people with different goals around one plan.', id: 'Menyelaraskan orang dengan tujuan berbeda pada satu rencana.' } },
  { id: 'leadership', name: { en: 'Leadership', id: 'Kepemimpinan' }, category: 'human', description: { en: 'Guiding a team and taking ownership of outcomes.', id: 'Memimpin tim dan bertanggung jawab atas hasil.' } },
  { id: 'public-speaking', name: 'Public Speaking', category: 'human', description: { en: 'Presenting with clarity and confidence.', id: 'Presentasi dengan jelas dan percaya diri.' } },
  { id: 'problem-solving', name: 'Problem Solving', category: 'human', description: { en: 'Structuring ambiguous problems into clear next steps.', id: 'Menstrukturkan masalah yang ambigu menjadi langkah yang jelas.' } },
  { id: 'storytelling', name: 'Storytelling', category: 'human', description: { en: 'Building a narrative around evidence.', id: 'Membangun narasi di sekitar bukti.' } },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export const CATEGORY_LABEL: Record<SkillCategory, Text> = {
  product: { en: 'Product', id: 'Produk' },
  data: { en: 'Data', id: 'Data' },
  design: { en: 'Design', id: 'Desain' },
  engineering: { en: 'Engineering', id: 'Engineering' },
  marketing: { en: 'Marketing', id: 'Marketing' },
  human: { en: 'Human skills', id: 'Soft skill' },
};

export const LEVEL_LABEL: Record<Level, Text> = {
  0: { en: 'Not yet', id: 'Belum' },
  1: { en: 'Beginner', id: 'Pemula' },
  2: { en: 'Intermediate', id: 'Menengah' },
  3: { en: 'Advanced', id: 'Mahir' },
  4: { en: 'Expert', id: 'Ahli' },
};

export const ROLES: Role[] = [
  {
    id: 'product-manager',
    name: 'Product Manager',
    tagline: { en: 'Decide what to build and why', id: 'Menentukan apa yang dibangun dan mengapa' },
    description: {
      en: 'Connects users, business and technology to ship products people love.',
      id: 'Menghubungkan pengguna, bisnis, dan teknologi untuk merilis produk yang dicintai.',
    },
    demand: { en: 'High demand in fintech, e-commerce and edtech', id: 'Permintaan tinggi di fintech, e-commerce, dan edtech' },
    openings: 412,
    color: '#0AB46A',
    requirements: [
      { skill: 'product-strategy', target: 3, weight: 3 },
      { skill: 'product-analytics', target: 3, weight: 3 },
      { skill: 'sql', target: 2, weight: 2 },
      { skill: 'user-research', target: 3, weight: 2 },
      { skill: 'communication', target: 3, weight: 2 },
      { skill: 'stakeholder', target: 3, weight: 2 },
      { skill: 'prd-writing', target: 3, weight: 2 },
      { skill: 'agile', target: 2, weight: 1 },
      { skill: 'ab-testing', target: 2, weight: 1 },
      { skill: 'leadership', target: 2, weight: 1 },
    ],
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    tagline: { en: 'Turn data into decisions', id: 'Mengubah data menjadi keputusan' },
    description: {
      en: 'Finds the story in the numbers and helps teams decide with evidence.',
      id: 'Menemukan cerita di balik angka dan membantu tim memutuskan berdasarkan bukti.',
    },
    demand: { en: 'Growing across every industry', id: 'Tumbuh di semua industri' },
    openings: 538,
    color: '#3B82C4',
    requirements: [
      { skill: 'sql', target: 3, weight: 3 },
      { skill: 'data-viz', target: 3, weight: 3 },
      { skill: 'statistics', target: 3, weight: 2 },
      { skill: 'python', target: 2, weight: 2 },
      { skill: 'excel', target: 3, weight: 2 },
      { skill: 'product-analytics', target: 2, weight: 2 },
      { skill: 'storytelling', target: 2, weight: 1 },
      { skill: 'communication', target: 2, weight: 1 },
      { skill: 'problem-solving', target: 3, weight: 1 },
    ],
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    tagline: { en: 'Design experiences that feel effortless', id: 'Merancang pengalaman yang terasa mudah' },
    description: {
      en: 'Researches, designs and tests interfaces that solve real problems.',
      id: 'Meriset, merancang, dan menguji antarmuka yang menyelesaikan masalah nyata.',
    },
    demand: { en: 'Steady demand in startups and agencies', id: 'Permintaan stabil di startup dan agensi' },
    openings: 297,
    color: '#7C6CD8',
    requirements: [
      { skill: 'figma', target: 3, weight: 3 },
      { skill: 'ui-design', target: 3, weight: 3 },
      { skill: 'user-research', target: 3, weight: 2 },
      { skill: 'prototyping', target: 3, weight: 2 },
      { skill: 'communication', target: 2, weight: 1 },
      { skill: 'storytelling', target: 2, weight: 1 },
      { skill: 'problem-solving', target: 2, weight: 1 },
    ],
  },
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    tagline: { en: 'Build reliable products at scale', id: 'Membangun produk andal dalam skala besar' },
    description: {
      en: 'Designs, builds and maintains the software behind digital products.',
      id: 'Merancang, membangun, dan merawat perangkat lunak di balik produk digital.',
    },
    demand: { en: 'Consistently the largest digital talent need', id: 'Kebutuhan talenta digital terbesar secara konsisten' },
    openings: 864,
    color: '#13201A',
    requirements: [
      { skill: 'javascript', target: 3, weight: 3 },
      { skill: 'react', target: 3, weight: 2 },
      { skill: 'apis', target: 3, weight: 3 },
      { skill: 'git', target: 3, weight: 2 },
      { skill: 'sql', target: 2, weight: 2 },
      { skill: 'problem-solving', target: 3, weight: 2 },
      { skill: 'communication', target: 2, weight: 1 },
    ],
  },
  {
    id: 'digital-marketer',
    name: 'Digital Marketing Specialist',
    tagline: { en: 'Grow audiences with data and stories', id: 'Menumbuhkan audiens dengan data dan cerita' },
    description: {
      en: 'Plans campaigns, measures results and grows brands online.',
      id: 'Merencanakan kampanye, mengukur hasil, dan menumbuhkan brand secara online.',
    },
    demand: { en: 'High demand in consumer brands', id: 'Permintaan tinggi di brand consumer' },
    openings: 351,
    color: '#FB9002',
    requirements: [
      { skill: 'content', target: 3, weight: 3 },
      { skill: 'seo', target: 3, weight: 2 },
      { skill: 'market-research', target: 3, weight: 2 },
      { skill: 'data-viz', target: 2, weight: 2 },
      { skill: 'storytelling', target: 3, weight: 2 },
      { skill: 'ab-testing', target: 2, weight: 1 },
      { skill: 'communication', target: 3, weight: 1 },
    ],
  },
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r])) as Record<RoleId, Role>;

export const UNIVERSITIES = [
  'Universitas Indonesia',
  'Institut Teknologi Bandung',
  'Universitas Gadjah Mada',
  'Institut Teknologi Sepuluh Nopember',
  'Universitas Brawijaya',
  'Universitas Diponegoro',
  'Universitas Bina Nusantara',
];

export const MAJORS = ['Information Systems', 'Informatics', 'Computer Science', 'Management', 'Visual Communication Design', 'Statistics', 'Industrial Engineering', 'Communication Studies'];
