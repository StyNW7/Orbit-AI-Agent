import type { Text } from '@/lib/i18n';

export type FacultyId = 'all' | 'cs' | 'is' | 'biz' | 'design';

export interface FacultyStats {
  id: FacultyId;
  name: Text;
  students: number;
  readiness: number;
  needGuidance: number;
  activeJourneys: number;
  readinessDelta: number;
  distribution: number[]; // <50, 50–59, 60–69, 70–79, 80+
  goals: { product: number; software: number; data: number; marketing: number; design: number };
  gaps: { skill: Text; pct: number }[];
  trend: number[]; // last 6 months avg readiness
}

const gap = (en: string, id: string, pct: number) => ({ skill: { en, id }, pct });

export const FACULTIES: FacultyStats[] = [
  {
    id: 'all',
    name: { en: 'All faculties', id: 'Semua fakultas' },
    students: 1284,
    readiness: 72,
    needGuidance: 183,
    activeJourneys: 946,
    readinessDelta: 5.4,
    distribution: [94, 208, 341, 402, 239],
    goals: { product: 268, software: 402, data: 251, marketing: 189, design: 174 },
    gaps: [gap('Data Analytics', 'Analitik Data', 46), gap('Public Speaking', 'Public Speaking', 41), gap('Product Strategy', 'Product Strategy', 37), gap('Interview Skills', 'Skill Wawancara', 35), gap('SQL', 'SQL', 31)],
    trend: [64, 66, 67, 69, 70, 72],
  },
  {
    id: 'cs',
    name: { en: 'Computer Science', id: 'Ilmu Komputer' },
    students: 412,
    readiness: 76,
    needGuidance: 38,
    activeJourneys: 331,
    readinessDelta: 6.1,
    distribution: [18, 44, 98, 152, 100],
    goals: { product: 52, software: 246, data: 78, marketing: 6, design: 30 },
    gaps: [gap('Public Speaking', 'Public Speaking', 52), gap('Interview Skills', 'Skill Wawancara', 44), gap('Product Strategy', 'Product Strategy', 33), gap('System Design', 'System Design', 29), gap('Stakeholder Management', 'Manajemen Stakeholder', 24)],
    trend: [67, 69, 71, 72, 74, 76],
  },
  {
    id: 'is',
    name: { en: 'Information Systems', id: 'Sistem Informasi' },
    students: 356,
    readiness: 73,
    needGuidance: 47,
    activeJourneys: 274,
    readinessDelta: 5.8,
    distribution: [24, 55, 92, 118, 67],
    goals: { product: 121, software: 96, data: 89, marketing: 18, design: 32 },
    gaps: [gap('Data Analytics', 'Analitik Data', 49), gap('SQL', 'SQL', 42), gap('Product Strategy', 'Product Strategy', 38), gap('Interview Skills', 'Skill Wawancara', 33), gap('A/B Testing', 'A/B Testing', 27)],
    trend: [65, 66, 68, 70, 71, 73],
  },
  {
    id: 'biz',
    name: { en: 'Business & Management', id: 'Bisnis & Manajemen' },
    students: 318,
    readiness: 68,
    needGuidance: 61,
    activeJourneys: 211,
    readinessDelta: 4.2,
    distribution: [34, 70, 92, 81, 41],
    goals: { product: 84, software: 8, data: 62, marketing: 142, design: 22 },
    gaps: [gap('Data Analytics', 'Analitik Data', 58), gap('SQL', 'SQL', 51), gap('Product Strategy', 'Product Strategy', 34), gap('Public Speaking', 'Public Speaking', 26), gap('Digital Marketing Tools', 'Tools Digital Marketing', 25)],
    trend: [61, 62, 64, 65, 66, 68],
  },
  {
    id: 'design',
    name: { en: 'Design & Communication', id: 'Desain & Komunikasi' },
    students: 198,
    readiness: 70,
    needGuidance: 37,
    activeJourneys: 130,
    readinessDelta: 4.9,
    distribution: [18, 39, 59, 51, 31],
    goals: { product: 11, software: 52, data: 22, marketing: 23, design: 90 },
    gaps: [gap('Portfolio Storytelling', 'Storytelling Portofolio', 47), gap('User Research', 'User Research', 39), gap('Interview Skills', 'Skill Wawancara', 36), gap('Data Analytics', 'Analitik Data', 30), gap('Prototyping', 'Prototyping', 22)],
    trend: [63, 64, 66, 67, 68, 70],
  },
];

export const GOAL_LABEL: Record<keyof FacultyStats['goals'], Text> = {
  product: { en: 'Product', id: 'Produk' },
  software: { en: 'Software Engineering', id: 'Software Engineering' },
  data: { en: 'Data', id: 'Data' },
  marketing: { en: 'Marketing', id: 'Marketing' },
  design: { en: 'Design', id: 'Desain' },
};

export interface CampusProgram {
  id: string;
  title: Text;
  gap: Text;
  students: number;
  impact: number;
  format: Text;
  weeks: number;
}

export const PROGRAMS: CampusProgram[] = [
  { id: 'prog-sql', title: { en: 'SQL Fundamentals Workshop', id: 'Workshop SQL Fundamentals' }, gap: { en: 'SQL & Data Analytics', id: 'SQL & Analitik Data' }, students: 312, impact: 3.1, format: { en: 'Hands-on lab · 4 sessions', id: 'Lab praktik · 4 sesi' }, weeks: 2 },
  { id: 'prog-portfolio', title: { en: 'Portfolio Clinic', id: 'Klinik Portofolio' }, gap: { en: 'Portfolio & storytelling', id: 'Portofolio & storytelling' }, students: 228, impact: 2.6, format: { en: '1:1 reviews with alumni', id: 'Review 1:1 dengan alumni' }, weeks: 3 },
  { id: 'prog-mentoring', title: { en: 'Career Mentoring Day', id: 'Career Mentoring Day' }, gap: { en: 'Experience & networking', id: 'Pengalaman & networking' }, students: 410, impact: 1.9, format: { en: 'Industry mentors on campus', id: 'Mentor industri di kampus' }, weeks: 1 },
  { id: 'prog-case', title: { en: 'Product Case Bootcamp', id: 'Product Case Bootcamp' }, gap: { en: 'Product Strategy', id: 'Product Strategy' }, students: 176, impact: 3.4, format: { en: 'Team case sprints', id: 'Sprint studi kasus tim' }, weeks: 2 },
  { id: 'prog-interview', title: { en: 'Interview Preparation Week', id: 'Pekan Persiapan Wawancara' }, gap: { en: 'Interview readiness', id: 'Kesiapan wawancara' }, students: 389, impact: 2.8, format: { en: 'Mock interviews · STAR coaching', id: 'Mock interview · coaching STAR' }, weeks: 1 },
];

export const GUIDANCE_SEGMENTS: { label: Text; count: number; share: number }[] = [
  { label: { en: 'Final-year, no internship yet', id: 'Tingkat akhir, belum magang' }, count: 74, share: 40 },
  { label: { en: 'No active journey for 30+ days', id: 'Tidak ada journey aktif 30+ hari' }, count: 62, share: 34 },
  { label: { en: 'Readiness below 50%', id: 'Kesiapan di bawah 50%' }, count: 47, share: 26 },
];
