import {
  BookOpen,
  BriefcaseBusiness,
  CalendarClock,
  Compass,
  Gauge,
  GraduationCap,
  Library,
  LineChart,
  Map as MapIcon,
  NotebookPen,
  Orbit as OrbitIcon,
  Route,
  Sparkles,
  SquareKanban,
  Sun,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { intlLocale, type Locale } from '@/lib/i18n';

type T = { en: string; id: string };

/** Locale-aware static number (7.38 / 7,38). */
export function fmt(value: number, locale: Locale, decimals = 0) {
  return value.toLocaleString(intlLocale(locale), { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─────────────────────────────────────────────────────────── Sources

export interface Source {
  id: string;
  org: string;
  title: T;
  year: string;
  url: string;
}

export const SOURCES: Source[] = [
  { id: 'bps-aug26', org: 'BPS · Sakernas', title: { en: '7.38 million unemployed, August 2026 (via Katadata Databoks)', id: '7,38 juta pengangguran, Agustus 2026 (via Katadata Databoks)' }, year: '2026', url: 'https://databoks.katadata.co.id/ketenagakerjaan/statistik/6aec350368270/ada-738-juta-pengangguran-di-indonesia-pada-agustus-2026' },
  { id: 'bps-edu26', org: 'BPS · Sakernas', title: { en: 'Unemployment by education level, August 2026 (via CNBC Indonesia)', id: 'Pengangguran menurut pendidikan, Agustus 2026 (via CNBC Indonesia)' }, year: '2026', url: 'https://www.cnbcindonesia.com/news/20261106084938-4-782835/880-ribu-sarjana-ri-masih-menganggur' },
  { id: 'bps-smk26', org: 'BPS · Sakernas', title: { en: 'Vocational (SMK) graduates record the highest unemployment rate (via Fortune IDN)', id: 'Lulusan SMK mencatat TPT tertinggi (via Fortune IDN)' }, year: '2026', url: 'https://www.fortuneidn.com/news/provinsi-dengan-tingkat-pengangguran-tertinggi-2026-versi-bps-d7w02-00-lflgw-1qgths' },
  { id: 'bps-neet', org: 'BPS · Sakernas', title: { en: '9.9 million Indonesians aged 15–24 are NEET (via CNBC Indonesia Research)', id: '9,9 juta penduduk usia 15–24 berstatus NEET (via CNBC Indonesia Research)' }, year: '2023', url: 'https://www.cnbcindonesia.com/research/20240515103217-128-538210/10-juta-gen-z-di-ri-nganggur-sekolah-kagak-kerja-kagak-maunya-apa' },
  { id: 'bps-mismatch', org: 'BPS · CNBC Indonesia Research', title: { en: '≈35% of young workers hold jobs that don’t match their education', id: '≈35% pekerja muda bekerja tak sesuai kualifikasi pendidikannya' }, year: '2025', url: 'https://www.cnbcindonesia.com/research/20251104154304-128-682220/pendidikan-tinggi-upah-rendah-35-pekerja-muda-salah-jurusan' },
  { id: 'iccn', org: 'Indonesia Career Center Network', title: { en: '87% of students feel their major doesn’t match their interests', id: '87% mahasiswa merasa jurusannya tak sesuai minat' }, year: '2017', url: 'https://www.goodnewsfromindonesia.id/2022/04/01/penyebab-fenomena-salah-jurusan' },
  { id: 'bappenas', org: 'Bappenas', title: { en: 'Choosing the wrong school or major is a driver of Gen Z unemployment', id: 'Salah memilih sekolah & jurusan jadi salah satu penyebab pengangguran Gen Z' }, year: '2024', url: 'https://www.cnbcindonesia.com/news/20240521074003-4-539932/bappenas-ungkap-penyebab-banyak-gen-z-nganggur-salah-jurusan' },
  { id: 'wef', org: 'World Economic Forum', title: { en: 'Future of Jobs Report 2025 — 39% of core skills will change by 2030', id: 'Future of Jobs Report 2025 — 39% skill inti berubah pada 2030' }, year: '2025', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/' },
];

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<string, Source>;

// ─────────────────────────────────────────────────────────── Opening hook (BPS, August 2026)

export const UNEMPLOYED_TOTAL = 7.38; // million
export const BREAKDOWN: { key: string; label: T; value: number; share: number; graduate: boolean; color: string }[] = [
  { key: 'sma', label: { en: 'High school (SMA)', id: 'Lulusan SMA' }, value: 2.38, share: 32.31, graduate: true, color: '#FB9002' },
  { key: 'smk', label: { en: 'Vocational (SMK)', id: 'Lulusan SMK' }, value: 1.83, share: 24.85, graduate: true, color: '#E2632A' },
  { key: 'uni', label: { en: 'University (D4–S3)', id: 'Sarjana (D4–S3)' }, value: 0.88, share: 11.93, graduate: true, color: '#C5192D' },
  { key: 'other', label: { en: 'Other levels', id: 'Jenjang lainnya' }, value: 2.29, share: 30.91, graduate: false, color: 'var(--border-strong)' },
];

// ─────────────────────────────────────────────────────────── Research

export interface Finding {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: T;
  claim: T;
  why: T;
  source: string;
  tone: 'orange' | 'danger' | 'green' | 'violet' | 'info';
  icon: LucideIcon;
}

export const FINDINGS: Finding[] = [
  {
    value: 9.9,
    decimals: 1,
    suffix: { en: 'M', id: ' jt' },
    claim: { en: 'young Indonesians (15–24) are not in work, school or training.', id: 'anak muda (15–24) tidak bekerja, tidak sekolah, dan tidak ikut pelatihan.' },
    why: { en: 'Many stopped — not for lack of ability, but lack of direction.', id: 'Banyak yang berhenti — bukan karena tak mampu, tapi tak punya arah.' },
    source: 'bps-neet',
    tone: 'danger',
    icon: Users,
  },
  {
    value: 87,
    suffix: { en: '%', id: '%' },
    claim: { en: 'of university students feel their major doesn’t match their interests.', id: 'mahasiswa merasa jurusannya tidak sesuai dengan minatnya.' },
    why: { en: 'They study for years without knowing what it is for.', id: 'Bertahun-tahun belajar tanpa tahu tujuannya untuk apa.' },
    source: 'iccn',
    tone: 'orange',
    icon: Compass,
  },
  {
    value: 35,
    prefix: '±',
    suffix: { en: '%', id: '%' },
    claim: { en: 'of young workers hold jobs that don’t match their education.', id: 'pekerja muda bekerja tidak sesuai kualifikasi pendidikannya.' },
    why: { en: 'What was learned and what work needs never met.', id: 'Yang dipelajari dan yang dibutuhkan dunia kerja tidak pernah bertemu.' },
    source: 'bps-mismatch',
    tone: 'violet',
    icon: BriefcaseBusiness,
  },
  {
    value: 8.2,
    decimals: 2,
    suffix: { en: '%', id: '%' },
    claim: { en: 'unemployment among SMK graduates — the highest of any education level.', id: 'tingkat pengangguran lulusan SMK — tertinggi dari semua jenjang.' },
    why: { en: 'Even job-focused schooling isn’t linked tightly enough to demand.', id: 'Bahkan sekolah kejuruan belum cukup terhubung dengan kebutuhan industri.' },
    source: 'bps-smk26',
    tone: 'danger',
    icon: GraduationCap,
  },
  {
    value: 39,
    suffix: { en: '%', id: '%' },
    claim: { en: 'of workers’ core skills are expected to change by 2030.', id: 'skill inti pekerja diperkirakan berubah pada 2030.' },
    why: { en: 'A static curriculum alone can’t keep up — learners need a live compass.', id: 'Kurikulum saja tak cukup mengejar — pelajar butuh kompas yang selalu update.' },
    source: 'wef',
    tone: 'info',
    icon: LineChart,
  },
];

// ─────────────────────────────────────────────────────────── Naya, before Orbit

export interface Stage {
  when: T;
  title: T;
  body: T;
  missing: T;
  mood: number; // 0–100 motivation
  feel: T;
  icon: LucideIcon;
}

export const STAGES: Stage[] = [
  {
    when: { en: 'Semester 1–2', id: 'Semester 1–2' },
    title: { en: 'Studying for grades', id: 'Belajar demi IPK' },
    body: { en: 'Attend, take notes, pass the exam. GPA 3.6 — yet no idea which classes matter for her future.', id: 'Hadir, mencatat, lulus ujian. IPK 3,6 — tapi tak tahu kelas mana yang penting untuk masa depannya.' },
    missing: { en: 'A clear goal', id: 'Tujuan yang jelas' },
    mood: 82,
    feel: { en: 'Excited', id: 'Semangat' },
    icon: BookOpen,
  },
  {
    when: { en: 'Semester 3–4', id: 'Semester 3–4' },
    title: { en: 'Following trends', id: 'Ikut-ikutan tren' },
    body: { en: 'Friends learn coding, she joins. Friends learn design, she joins. 12 courses saved, 1 finished.', id: 'Teman belajar coding, ia ikut. Teman belajar desain, ia ikut. 12 kursus disimpan, 1 selesai.' },
    missing: { en: 'Skill priorities', id: 'Prioritas skill' },
    mood: 63,
    feel: { en: 'Unsure', id: 'Ragu' },
    icon: Library,
  },
  {
    when: { en: 'Semester 5', id: 'Semester 5' },
    title: { en: 'Searching alone', id: 'Mencari sendirian' },
    body: { en: 'Internships, events, mentors and books are scattered across chats, socials and portals. Deadlines slip by.', id: 'Info magang, event, mentor, dan buku tercecer di grup chat, media sosial, dan portal. Deadline sering terlewat.' },
    missing: { en: 'Relevant opportunities & mentors', id: 'Peluang & mentor yang relevan' },
    mood: 44,
    feel: { en: 'Overwhelmed', id: 'Kewalahan' },
    icon: CalendarClock,
  },
  {
    when: { en: 'Semester 6', id: 'Semester 6' },
    title: { en: 'Losing motivation', id: 'Kehilangan semangat' },
    body: { en: 'No visible progress, no one to check in with. Effort starts to feel pointless.', id: 'Tak ada progres yang terlihat, tak ada yang mendampingi. Usaha mulai terasa sia-sia.' },
    missing: { en: 'Measurable progress', id: 'Progres yang terukur' },
    mood: 28,
    feel: { en: 'Drained', id: 'Lelah' },
    icon: LineChart,
  },
  {
    when: { en: 'Semester 7', id: 'Semester 7' },
    title: { en: 'Final-year panic', id: 'Panik di semester akhir' },
    body: { en: '214 job listings, no idea which fit. CV_final_v7.pdf. Her skill gaps surface only now.', id: '214 lowongan, tak tahu mana yang cocok. CV_final_v7.pdf. Gap skill-nya baru ketahuan sekarang.' },
    missing: { en: 'Career readiness', id: 'Kesiapan karier' },
    mood: 12,
    feel: { en: 'Afraid', id: 'Takut' },
    icon: BriefcaseBusiness,
  },
];

// ─────────────────────────────────────────────────────────── Orbit pillars

export interface Demo {
  label: T;
  to: string;
  icon: LucideIcon;
  /** Open the Orbit Agent once the app is shown. */
  agent?: boolean;
}

export interface Pillar {
  id: string;
  n: string;
  name: T;
  verb: T;
  feature: string;
  icon: LucideIcon;
  color: string;
  /** Which of Naya's before-Orbit stages this answers (index in STAGES). */
  answers: number;
  pain: T;
  desc: T;
  points: T[];
  demos: Demo[];
}

export const PILLARS: Pillar[] = [
  {
    id: 'start',
    n: '01',
    name: { en: 'Build your Orbit', id: 'Bangun Orbit-mu' },
    verb: { en: 'Start', id: 'Mulai' },
    feature: 'Build My Orbit · Onboarding',
    icon: UserPlus,
    color: '#0E9F8E',
    answers: 0,
    pain: { en: '“I don’t even know where to start.”', id: '“Aku bahkan tidak tahu harus mulai dari mana.”' },
    desc: { en: 'Create your Orbit account first: fill in your Career Profile, choose a career goal and rate your skills. Orbit then runs your first career analysis on the spot.', id: 'Buat akun Orbit terlebih dahulu: isi Career Profile, pilih tujuan karier, dan nilai skill-mu. Orbit langsung menjalankan analisis karier pertamamu saat itu juga.' },
    points: [
      { en: 'Three short steps: profile, goal, skills', id: 'Tiga langkah singkat: profil, tujuan, skill' },
      { en: 'Your first career analysis in seconds', id: 'Analisis karier pertamamu dalam hitungan detik' },
      { en: 'Try it as Naya, or build your own', id: 'Coba sebagai Naya, atau bangun milikmu sendiri' },
    ],
    demos: [{ label: { en: 'Build My Orbit', id: 'Bangun Orbit Saya' }, to: '/start', icon: UserPlus }],
  },
  {
    id: 'understand',
    n: '02',
    name: { en: 'Know where you stand', id: 'Pahami posisimu' },
    verb: { en: 'Understand', id: 'Pahami' },
    feature: 'Career Intelligence',
    icon: Gauge,
    color: '#0AB46A',
    answers: 4,
    pain: { en: '“My skill gaps surface only in my final year.”', id: '“Gap skill-ku baru ketahuan di semester akhir.”' },
    desc: { en: 'An explainable Career Readiness score across six dimensions — and the gaps that matter most, ranked.', id: 'Skor Career Readiness yang dijelaskan dari enam dimensi — lengkap dengan gap paling penting, sudah diurutkan.' },
    points: [
      { en: 'Readiness 0–100%, never a black box', id: 'Kesiapan 0–100%, bukan kotak hitam' },
      { en: 'Gaps ranked by real job demand', id: 'Gap diurutkan dari permintaan kerja nyata' },
      { en: 'Know your gaps from semester one', id: 'Tahu gap-mu sejak semester satu' },
    ],
    demos: [{ label: { en: 'Open Career Intelligence', id: 'Buka Career Intelligence' }, to: '/app/intelligence', icon: Gauge }],
  },
  {
    id: 'learn',
    n: '03',
    name: { en: 'Learn with purpose', id: 'Belajar terarah' },
    verb: { en: 'Learn', id: 'Belajar' },
    feature: 'Learning Map · Knowledge Vault',
    icon: GraduationCap,
    color: '#2FBB68',
    answers: 0,
    pain: { en: '“I pass classes, but don’t know what they’re for.”', id: '“Aku lulus mata kuliah, tapi tak tahu gunanya untuk apa.”' },
    desc: { en: 'Every class is mapped to the skills and career it powers. Notes, slides, assignments and projects live in one vault, read by AI.', id: 'Setiap mata kuliah dipetakan ke skill dan karier yang didukungnya. Catatan, slide, tugas, dan proyek tersimpan di satu vault, dibaca oleh AI.' },
    points: [
      { en: 'Each class shows why it matters', id: 'Tiap mata kuliah menunjukkan kenapa penting' },
      { en: 'Upload materials — AI extracts the skills', id: 'Unggah materi — AI menemukan skill-nya' },
      { en: 'Complements your school and lecturers', id: 'Melengkapi sekolah dan dosenmu' },
    ],
    demos: [
      { label: { en: 'Open Learning Map', id: 'Buka Learning Map' }, to: '/app/learning?view=map', icon: MapIcon },
      { label: { en: 'Knowledge Vault', id: 'Knowledge Vault' }, to: '/app/learning', icon: Library },
    ],
  },
  {
    id: 'explore',
    n: '04',
    name: { en: 'Explore your universe', id: 'Jelajahi kemungkinan' },
    verb: { en: 'Explore', id: 'Jelajahi' },
    feature: 'Career Universe',
    icon: OrbitIcon,
    color: '#3B82C4',
    answers: 1,
    pain: { en: '“I just follow whatever my friends learn.”', id: '“Aku cuma ikut apa yang dipelajari teman.”' },
    desc: { en: 'A living map connecting you to roles, skills, courses, mentors and openings. More than one dream? Build several orbits.', id: 'Peta hidup yang menghubungkanmu dengan peran, skill, kursus, mentor, dan lowongan. Punya lebih dari satu impian? Bangun beberapa orbit.' },
    points: [
      { en: 'See how every skill links to a role', id: 'Lihat bagaimana tiap skill terhubung ke peran' },
      { en: 'Compare career paths side by side', id: 'Bandingkan jalur karier berdampingan' },
      { en: 'Multiple dream orbits, one profile', id: 'Banyak orbit impian, satu profil' },
    ],
    demos: [{ label: { en: 'Open Career Universe', id: 'Buka Career Universe' }, to: '/app/universe', icon: OrbitIcon }],
  },
  {
    id: 'plan',
    n: '05',
    name: { en: 'Plan the path', id: 'Rencanakan langkah' },
    verb: { en: 'Plan', id: 'Rencana' },
    feature: 'Journey',
    icon: Route,
    color: '#7C6CD8',
    answers: 1,
    pain: { en: '“12 courses saved, only 1 finished.”', id: '“12 kursus disimpan, cuma 1 yang selesai.”' },
    desc: { en: 'A phased roadmap and weekly quests built from your gaps. Orbit proposes, you decide.', id: 'Roadmap bertahap dan quest mingguan yang disusun dari gap-mu. Orbit mengusulkan, kamu yang memutuskan.' },
    points: [
      { en: 'Roadmap from today to job-ready', id: 'Roadmap dari hari ini hingga siap kerja' },
      { en: 'Quests sized for one week', id: 'Quest seukuran satu minggu' },
      { en: 'Asks before changing your plan', id: 'Bertanya sebelum mengubah rencanamu' },
    ],
    demos: [
      { label: { en: 'Open Journey roadmap', id: 'Buka roadmap Journey' }, to: '/app/journey?view=roadmap', icon: Route },
      { label: { en: 'Quest board', id: 'Papan quest' }, to: '/app/journey?view=board', icon: SquareKanban },
    ],
  },
  {
    id: 'connect',
    n: '06',
    name: { en: 'Find the right opportunities', id: 'Temukan peluang' },
    verb: { en: 'Discover', id: 'Temukan' },
    feature: 'Discover',
    icon: Compass,
    color: '#FB9002',
    answers: 2,
    pain: { en: '“Info is scattered — I keep missing deadlines.”', id: '“Info tercecer — aku sering ketinggalan deadline.”' },
    desc: { en: 'Internships, jobs, courses, events, mentors and books in one place — ranked by fit with your goal.', id: 'Magang, kerja, kursus, event, mentor, dan buku dalam satu tempat — diurutkan dari kecocokan dengan tujuanmu.' },
    points: [
      { en: 'Match score explains every pick', id: 'Skor kecocokan menjelaskan setiap pilihan' },
      { en: 'Save, track and set reminders', id: 'Simpan, pantau, dan pasang pengingat' },
      { en: 'Mentors who walked the same path', id: 'Mentor yang pernah menempuh jalur sama' },
    ],
    demos: [
      { label: { en: 'Open Discover', id: 'Buka Discover' }, to: '/app/discover', icon: Compass },
      { label: { en: 'Mentors', id: 'Mentor' }, to: '/app/discover?type=mentor', icon: Users },
    ],
  },
  {
    id: 'grow',
    n: '07',
    name: { en: 'Grow every day', id: 'Tumbuh setiap hari' },
    verb: { en: 'Grow', id: 'Tumbuh' },
    feature: 'Today · Progress · Orbit Agent',
    icon: Sparkles,
    color: '#D47900',
    answers: 3,
    pain: { en: '“No visible progress — why even try?”', id: '“Tak ada progres yang terlihat — buat apa berusaha?”' },
    desc: { en: 'One Next Best Action a day, XP and streaks, progress you can see — and an AI agent ready to help.', id: 'Satu Next Best Action setiap hari, XP dan streak, progres yang terlihat — plus agen AI yang siap membantu.' },
    points: [
      { en: 'Always one clear next step', id: 'Selalu ada satu langkah berikutnya yang jelas' },
      { en: 'Readiness that moves with every quest', id: 'Kesiapan yang naik di setiap quest' },
      { en: 'Orbit Agent plans with you, in EN/ID', id: 'Orbit Agent merencanakan bersamamu, EN/ID' },
    ],
    demos: [
      { label: { en: 'Open Today', id: 'Buka Today' }, to: '/app', icon: Sun },
      { label: { en: 'Progress', id: 'Progress' }, to: '/app/progress', icon: LineChart },
      { label: { en: 'Career Journal', id: 'Career Journal' }, to: '/app/journal', icon: NotebookPen },
      { label: { en: 'Ask Orbit Agent', id: 'Tanya Orbit Agent' }, to: '/app', icon: Sparkles, agent: true },
    ],
  },
];
