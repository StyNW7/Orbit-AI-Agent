/**
 * Learning Map — the bridge between what students learn in class and the careers it powers.
 *
 * Orbit never replaces the teacher, lecturer or curriculum. It reads the curriculum a learner
 * already follows and shows, per class, which career skills it builds, how much it matters for a
 * target role, and how to turn it into evidence (with a question to bring back to the lecturer).
 */
import type { Text } from '@/lib/i18n';
import type { Level, Profile, RoleId } from './types';
import { ROLES, ROLE_BY_ID } from './catalog';

/** school = SMA/SMK subject · campus = university course · co = co-curricular learning */
export type CourseLevel = 'school' | 'campus' | 'co';

export interface CourseSkill {
  skill: string;
  /** How strongly the class trains this skill: 1 touches · 2 practises · 3 is the core of the class */
  weight: 1 | 2 | 3;
}

export interface Course {
  id: string;
  name: Text;
  level: CourseLevel;
  /** Majors whose curriculum usually includes it; 'all' = general/required course. */
  majors: string[] | 'all';
  /** Typical semester it is taken (school subjects use 0). */
  semester: number;
  credits: number;
  skills: CourseSkill[];
  /** Plain-language answer to “when will I ever use this?” */
  why: Text;
  /** Applied mini-project that turns the class into career evidence. */
  project: Text;
  /** A question to bring to the teacher or lecturer — Orbit complements them. */
  ask: Text;
}

const IS = 'Information Systems';
const INF = 'Informatics';
const CS = 'Computer Science';
const MGMT = 'Management';
const VCD = 'Visual Communication Design';
const STAT = 'Statistics';
const IE = 'Industrial Engineering';
const COMM = 'Communication Studies';

const t = (en: string, id: string): Text => ({ en, id });

export const COURSES: Course[] = [
  // ─────────────── Campus courses
  {
    id: 'english',
    name: t('Academic English', 'Bahasa Inggris Akademik'),
    level: 'campus',
    majors: 'all',
    semester: 1,
    credits: 2,
    skills: [{ skill: 'communication', weight: 3 }, { skill: 'public-speaking', weight: 1 }, { skill: 'storytelling', weight: 1 }],
    why: t('Most documentation, courses and global roles run in English — it multiplies everything else you learn.', 'Sebagian besar dokumentasi, kursus, dan peran global memakai bahasa Inggris — ini melipatgandakan semua hal lain yang kamu pelajari.'),
    project: t('Rewrite one class project summary as a one-page English case study for your portfolio.', 'Tulis ulang ringkasan satu proyek kuliah menjadi studi kasus satu halaman berbahasa Inggris untuk portofolio.'),
    ask: t('Could my final essay analyse a real company or product in the field I want to work in?', 'Bolehkah esai akhir saya menganalisis perusahaan atau produk nyata di bidang yang ingin saya geluti?'),
  },
  {
    id: 'algorithms',
    name: t('Algorithms & Programming', 'Algoritma & Pemrograman'),
    level: 'campus',
    majors: [IS, INF, CS, STAT],
    semester: 1,
    credits: 4,
    skills: [{ skill: 'problem-solving', weight: 3 }, { skill: 'python', weight: 2 }, { skill: 'javascript', weight: 1 }],
    why: t('Breaking a problem into steps is the core of engineering — and of every analytical role.', 'Memecah masalah menjadi langkah adalah inti engineering — dan inti setiap peran analitis.'),
    project: t('Automate one boring task you do every week and publish the script on GitHub with a README.', 'Otomatiskan satu tugas membosankan yang kamu lakukan tiap minggu dan publikasikan script-nya di GitHub dengan README.'),
    ask: t('Which assignment from this class would best show problem-solving to a recruiter?', 'Tugas mana dari kelas ini yang paling bisa menunjukkan kemampuan problem solving ke rekruter?'),
  },
  {
    id: 'visual-design',
    name: t('Visual Design Fundamentals', 'Dasar Desain Visual (Nirmana)'),
    level: 'campus',
    majors: [VCD],
    semester: 1,
    credits: 3,
    skills: [{ skill: 'ui-design', weight: 3 }, { skill: 'storytelling', weight: 1 }, { skill: 'figma', weight: 1 }],
    why: t('Hierarchy, contrast and grids are exactly what makes an interface easy to use.', 'Hierarki, kontras, dan grid adalah hal yang membuat antarmuka mudah digunakan.'),
    project: t('Redesign one screen of an app you use daily and explain each visual decision.', 'Desain ulang satu layar aplikasi yang kamu pakai setiap hari dan jelaskan setiap keputusan visualnya.'),
    ask: t('Can I apply this week’s principles to a digital interface instead of a poster?', 'Bolehkah saya menerapkan prinsip minggu ini pada antarmuka digital, bukan poster?'),
  },
  {
    id: 'biz-comm',
    name: t('Business Communication', 'Komunikasi Bisnis'),
    level: 'campus',
    majors: 'all',
    semester: 2,
    credits: 2,
    skills: [{ skill: 'communication', weight: 3 }, { skill: 'public-speaking', weight: 3 }, { skill: 'storytelling', weight: 2 }],
    why: t('Every role is decided in meetings and interviews — clear communication is the multiplier.', 'Setiap peran ditentukan di rapat dan wawancara — komunikasi yang jelas adalah pengganda.'),
    project: t('Record a 3-minute pitch of your best project and ask two friends for feedback.', 'Rekam pitch 3 menit tentang proyek terbaikmu dan minta masukan dari dua teman.'),
    ask: t('Could we practise answering interview questions as one of the speaking exercises?', 'Bisakah latihan berbicara kita memakai pertanyaan wawancara kerja?'),
  },
  {
    id: 'accounting',
    name: t('Introduction to Accounting', 'Pengantar Akuntansi'),
    level: 'campus',
    majors: [MGMT, IS],
    semester: 2,
    credits: 3,
    skills: [{ skill: 'excel', weight: 3 }, { skill: 'problem-solving', weight: 1 }, { skill: 'data-viz', weight: 1 }],
    why: t('Reading numbers about money is how you speak the language of business owners.', 'Membaca angka keuangan adalah cara berbicara dengan bahasa pemilik bisnis.'),
    project: t('Build a simple cash-flow tracker in Sheets for a student organisation or small shop.', 'Buat pelacak arus kas sederhana di Sheets untuk organisasi mahasiswa atau toko kecil.'),
    ask: t('Is there a real small-business dataset we could practise with?', 'Apakah ada dataset usaha kecil yang nyata untuk latihan?'),
  },
  {
    id: 'org',
    name: t('Student Organisation & Committees', 'Organisasi & Kepanitiaan'),
    level: 'co',
    majors: 'all',
    semester: 2,
    credits: 0,
    skills: [{ skill: 'leadership', weight: 3 }, { skill: 'stakeholder', weight: 2 }, { skill: 'public-speaking', weight: 2 }, { skill: 'agile', weight: 1 }],
    why: t('Running events is real project and people management — recruiters ask about it in almost every interview.', 'Menjalankan acara adalah manajemen proyek dan orang yang nyata — rekruter menanyakannya di hampir setiap wawancara.'),
    project: t('Write a STAR story about one problem you solved in your committee, with a number in the result.', 'Tulis cerita STAR tentang satu masalah yang kamu selesaikan di kepanitiaan, lengkap dengan angka hasilnya.'),
    ask: t('Could my academic advisor help me frame this experience for my CV?', 'Bisakah dosen pembimbing akademik membantu saya membingkai pengalaman ini untuk CV?'),
  },
  {
    id: 'statistics',
    name: t('Statistics', 'Statistika'),
    level: 'campus',
    majors: [IS, INF, CS, MGMT, STAT, IE],
    semester: 3,
    credits: 3,
    skills: [{ skill: 'statistics', weight: 3 }, { skill: 'ab-testing', weight: 2 }, { skill: 'product-analytics', weight: 2 }, { skill: 'excel', weight: 1 }],
    why: t('Every A/B test, dashboard and data-driven decision in a tech company is built on this class.', 'Setiap A/B test, dashboard, dan keputusan berbasis data di perusahaan teknologi dibangun dari kelas ini.'),
    project: t('Run a mini A/B analysis on a public dataset and write up whether the result is significant.', 'Lakukan analisis A/B mini pada dataset publik dan tuliskan apakah hasilnya signifikan.'),
    ask: t('Could my final assignment analyse an experiment from a real app or product?', 'Bolehkah tugas akhir saya menganalisis eksperimen dari aplikasi atau produk nyata?'),
  },
  {
    id: 'database',
    name: t('Database Systems', 'Sistem Basis Data'),
    level: 'campus',
    majors: [IS, INF, CS],
    semester: 3,
    credits: 3,
    skills: [{ skill: 'sql', weight: 3 }, { skill: 'apis', weight: 1 }, { skill: 'product-analytics', weight: 1 }, { skill: 'problem-solving', weight: 1 }],
    why: t('SQL is asked for in most data, product and engineering openings — this is where you learn it properly.', 'SQL diminta di sebagian besar lowongan data, produk, dan engineering — di kelas inilah kamu mempelajarinya dengan benar.'),
    project: t('Answer five real business questions with SQL on an open e-commerce dataset and publish the queries.', 'Jawab lima pertanyaan bisnis nyata dengan SQL pada dataset e-commerce terbuka dan publikasikan query-nya.'),
    ask: t('Beyond design and normalisation, could we practise analytical queries like funnels and cohorts?', 'Selain desain dan normalisasi, bisakah kita berlatih query analitis seperti funnel dan cohort?'),
  },
  {
    id: 'marketing-mgmt',
    name: t('Marketing Management', 'Manajemen Pemasaran'),
    level: 'campus',
    majors: [MGMT, COMM, VCD],
    semester: 3,
    credits: 3,
    skills: [{ skill: 'market-research', weight: 3 }, { skill: 'content', weight: 2 }, { skill: 'product-strategy', weight: 1 }, { skill: 'seo', weight: 1 }],
    why: t('Understanding customers and markets is the starting point of every product and campaign.', 'Memahami pelanggan dan pasar adalah titik awal setiap produk dan kampanye.'),
    project: t('Write a one-page go-to-market plan for a local brand you like.', 'Tulis rencana go-to-market satu halaman untuk brand lokal yang kamu sukai.'),
    ask: t('Could our group project use a real local business as the client?', 'Bolehkah proyek kelompok kami memakai usaha lokal nyata sebagai klien?'),
  },
  {
    id: 'web-prog',
    name: t('Web Programming', 'Pemrograman Web'),
    level: 'campus',
    majors: [IS, INF, CS],
    semester: 4,
    credits: 3,
    skills: [{ skill: 'javascript', weight: 3 }, { skill: 'react', weight: 2 }, { skill: 'apis', weight: 2 }, { skill: 'git', weight: 1 }],
    why: t('The web is where most digital products live — this class is a direct line into engineering roles.', 'Web adalah tempat sebagian besar produk digital berada — kelas ini jalur langsung ke peran engineering.'),
    project: t('Deploy your class project online with a clean README so anyone can try it.', 'Deploy proyek kuliahmu secara online dengan README yang rapi agar siapa pun bisa mencobanya.'),
    ask: t('Could we use Git and code reviews for group assignments, like real teams do?', 'Bisakah tugas kelompok memakai Git dan code review, seperti tim sungguhan?'),
  },
  {
    id: 'hci',
    name: t('Human–Computer Interaction', 'Interaksi Manusia & Komputer'),
    level: 'campus',
    majors: [IS, INF, CS, VCD],
    semester: 4,
    credits: 3,
    skills: [{ skill: 'user-research', weight: 3 }, { skill: 'prototyping', weight: 2 }, { skill: 'figma', weight: 2 }, { skill: 'ui-design', weight: 1 }],
    why: t('Talking to users and testing ideas is the daily work of designers and product managers.', 'Berbicara dengan pengguna dan menguji ide adalah pekerjaan harian desainer dan product manager.'),
    project: t('Run five usability tests on a campus app and turn the findings into a short case study.', 'Lakukan lima uji usability pada aplikasi kampus dan ubah temuannya menjadi studi kasus singkat.'),
    ask: t('Could we test our prototypes with real students instead of classmates only?', 'Bisakah prototipe kami diuji ke mahasiswa lain, bukan hanya teman sekelas?'),
  },
  {
    id: 'regression',
    name: t('Regression Analysis', 'Analisis Regresi'),
    level: 'campus',
    majors: [STAT],
    semester: 4,
    credits: 3,
    skills: [{ skill: 'statistics', weight: 3 }, { skill: 'python', weight: 2 }, { skill: 'data-viz', weight: 1 }],
    why: t('Forecasting and finding what drives a number is the heart of analytics work.', 'Memprediksi dan menemukan apa yang menggerakkan sebuah angka adalah inti pekerjaan analitik.'),
    project: t('Model what drives one business metric in a public dataset and present it in five charts.', 'Modelkan apa yang menggerakkan satu metrik bisnis di dataset publik dan sajikan dalam lima grafik.'),
    ask: t('Could we do the assignments in Python as well as in a statistics package?', 'Bisakah tugas dikerjakan dengan Python selain dengan paket statistik?'),
  },
  {
    id: 'ops-research',
    name: t('Operations Research', 'Riset Operasi'),
    level: 'campus',
    majors: [IE, MGMT, STAT],
    semester: 4,
    credits: 3,
    skills: [{ skill: 'problem-solving', weight: 3 }, { skill: 'excel', weight: 2 }, { skill: 'statistics', weight: 2 }],
    why: t('Optimising limited resources is what operations, supply-chain and analyst roles do every day.', 'Mengoptimalkan sumber daya terbatas adalah pekerjaan harian peran operasional, supply chain, dan analis.'),
    project: t('Optimise a real schedule (canteen staff, lab rooms, delivery routes) and show the savings.', 'Optimalkan jadwal nyata (staf kantin, ruang lab, rute antar) dan tunjukkan penghematannya.'),
    ask: t('Is there a campus operation we could optimise as a class case?', 'Adakah operasional kampus yang bisa kita optimalkan sebagai studi kasus kelas?'),
  },
  {
    id: 'public-relations',
    name: t('Public Relations', 'Hubungan Masyarakat'),
    level: 'campus',
    majors: [COMM],
    semester: 4,
    credits: 3,
    skills: [{ skill: 'storytelling', weight: 3 }, { skill: 'communication', weight: 3 }, { skill: 'content', weight: 2 }, { skill: 'public-speaking', weight: 2 }],
    why: t('Shaping a story people trust is the base of marketing, communications and community roles.', 'Membangun cerita yang dipercaya orang adalah dasar peran marketing, komunikasi, dan komunitas.'),
    project: t('Plan and measure a small content campaign for a campus event.', 'Rencanakan dan ukur kampanye konten kecil untuk acara kampus.'),
    ask: t('Could we measure our campaign with real analytics instead of estimates?', 'Bisakah kampanye kami diukur dengan analitik nyata, bukan perkiraan?'),
  },
  {
    id: 'system-analysis',
    name: t('Systems Analysis & Design', 'Analisis & Perancangan Sistem'),
    level: 'campus',
    majors: [IS, INF],
    semester: 5,
    credits: 3,
    skills: [{ skill: 'prd-writing', weight: 3 }, { skill: 'stakeholder', weight: 2 }, { skill: 'problem-solving', weight: 2 }, { skill: 'agile', weight: 1 }],
    why: t('Requirements, user stories and process diagrams are what product managers and analysts write every week.', 'Kebutuhan sistem, user story, dan diagram proses adalah yang ditulis product manager dan analis setiap minggu.'),
    project: t('Turn your class system design into a real PRD with user stories and success metrics.', 'Ubah rancangan sistem di kelas menjadi PRD nyata lengkap dengan user story dan metrik keberhasilan.'),
    ask: t('Could we add success metrics to the requirements document, the way product teams do?', 'Bisakah dokumen kebutuhan kita ditambah metrik keberhasilan, seperti yang dilakukan tim produk?'),
  },
  {
    id: 'software-eng',
    name: t('Software Engineering', 'Rekayasa Perangkat Lunak'),
    level: 'campus',
    majors: [IS, INF, CS],
    semester: 5,
    credits: 3,
    skills: [{ skill: 'agile', weight: 3 }, { skill: 'git', weight: 2 }, { skill: 'apis', weight: 1 }, { skill: 'prd-writing', weight: 1 }],
    why: t('Sprints, backlogs and reviews are how every modern digital team ships.', 'Sprint, backlog, dan review adalah cara setiap tim digital modern merilis produk.'),
    project: t('Run your group project in two-week sprints and document the retro in your journal.', 'Jalankan proyek kelompok dalam sprint dua minggu dan dokumentasikan retro-nya di journal.'),
    ask: t('Could one of us act as product owner so we practise real Scrum roles?', 'Bisakah salah satu dari kami berperan sebagai product owner agar kami berlatih peran Scrum sungguhan?'),
  },
  {
    id: 'entrepreneurship',
    name: t('Entrepreneurship', 'Kewirausahaan'),
    level: 'campus',
    majors: 'all',
    semester: 5,
    credits: 2,
    skills: [{ skill: 'market-research', weight: 3 }, { skill: 'product-strategy', weight: 2 }, { skill: 'communication', weight: 1 }, { skill: 'leadership', weight: 1 }],
    why: t('Validating an idea before building it is the same skill product and marketing teams are hired for.', 'Memvalidasi ide sebelum membangunnya adalah skill yang sama yang dicari tim produk dan marketing.'),
    project: t('Interview ten potential customers and write a one-page validation report.', 'Wawancarai sepuluh calon pelanggan dan tulis laporan validasi satu halaman.'),
    ask: t('Could we pitch our business plan to an alumni founder for feedback?', 'Bisakah rencana bisnis kami dipresentasikan ke alumni founder untuk mendapat masukan?'),
  },
  {
    id: 'digital-marketing',
    name: t('Digital Marketing', 'Pemasaran Digital'),
    level: 'campus',
    majors: [MGMT, COMM, VCD],
    semester: 5,
    credits: 3,
    skills: [{ skill: 'seo', weight: 3 }, { skill: 'content', weight: 3 }, { skill: 'ab-testing', weight: 1 }, { skill: 'data-viz', weight: 1 }],
    why: t('Campaigns are now planned, tested and measured online — this class is the job itself.', 'Kampanye kini direncanakan, diuji, dan diukur secara online — kelas ini adalah pekerjaannya sendiri.'),
    project: t('Grow a small account or blog for four weeks and report the numbers honestly.', 'Kembangkan akun atau blog kecil selama empat minggu dan laporkan angkanya dengan jujur.'),
    ask: t('Could our grade include the measured result, not only the plan?', 'Bisakah nilai kami mencakup hasil terukur, bukan hanya rencananya?'),
  },
  {
    id: 'ux-studio',
    name: t('UX Design Studio', 'Studio Desain UX'),
    level: 'campus',
    majors: [VCD, IS],
    semester: 5,
    credits: 4,
    skills: [{ skill: 'figma', weight: 3 }, { skill: 'prototyping', weight: 3 }, { skill: 'user-research', weight: 2 }, { skill: 'ui-design', weight: 2 }],
    why: t('Studio work is the closest thing to a real design team — and the best portfolio material you will have.', 'Kerja studio paling mirip tim desain sungguhan — dan materi portofolio terbaik yang akan kamu punya.'),
    project: t('Turn your studio project into a portfolio case study: problem, process, trade-offs, outcome.', 'Ubah proyek studio menjadi studi kasus portofolio: masalah, proses, trade-off, dan hasil.'),
    ask: t('Could the final critique include a designer from industry?', 'Bisakah kritik akhir melibatkan desainer dari industri?'),
  },
  {
    id: 'data-mining',
    name: t('Data Mining & Business Intelligence', 'Data Mining & Intelijen Bisnis'),
    level: 'campus',
    majors: [IS, INF, CS, STAT],
    semester: 6,
    credits: 3,
    skills: [{ skill: 'data-viz', weight: 3 }, { skill: 'python', weight: 2 }, { skill: 'product-analytics', weight: 2 }, { skill: 'statistics', weight: 2 }],
    why: t('Dashboards and insight decks are what analysts and product teams use to decide.', 'Dashboard dan deck insight adalah alat analis dan tim produk untuk mengambil keputusan.'),
    project: t('Build a public dashboard that answers one real question and write the three insights it shows.', 'Bangun dashboard publik yang menjawab satu pertanyaan nyata dan tulis tiga insight yang ditunjukkannya.'),
    ask: t('Could we present insights as recommendations to a decision-maker, not only as charts?', 'Bisakah insight kami disajikan sebagai rekomendasi untuk pengambil keputusan, bukan hanya grafik?'),
  },
  {
    id: 'it-pm',
    name: t('IT Project Management', 'Manajemen Proyek TI'),
    level: 'campus',
    majors: [IS, IE, MGMT],
    semester: 6,
    credits: 3,
    skills: [{ skill: 'stakeholder', weight: 3 }, { skill: 'agile', weight: 2 }, { skill: 'leadership', weight: 2 }, { skill: 'communication', weight: 1 }],
    why: t('Keeping people, scope and deadlines aligned is half of every product and project role.', 'Menyelaraskan orang, ruang lingkup, dan tenggat adalah separuh dari setiap peran produk dan proyek.'),
    project: t('Write a project charter and risk log for a real campus or community project.', 'Tulis project charter dan risk log untuk proyek kampus atau komunitas yang nyata.'),
    ask: t('Could we manage a real project from a partner organisation this semester?', 'Bisakah kita mengelola proyek nyata dari organisasi mitra semester ini?'),
  },
  {
    id: 'research-methods',
    name: t('Research Methodology', 'Metodologi Penelitian'),
    level: 'campus',
    majors: 'all',
    semester: 6,
    credits: 2,
    skills: [{ skill: 'user-research', weight: 2 }, { skill: 'statistics', weight: 2 }, { skill: 'problem-solving', weight: 2 }, { skill: 'storytelling', weight: 1 }],
    why: t('Asking the right question and proving the answer is what turns opinions into decisions at work.', 'Mengajukan pertanyaan yang tepat dan membuktikan jawabannya mengubah opini menjadi keputusan di dunia kerja.'),
    project: t('Draft a research proposal on a problem from the industry you want to enter.', 'Susun proposal penelitian tentang masalah dari industri yang ingin kamu masuki.'),
    ask: t('Could my thesis topic be aligned with the career I am aiming for?', 'Bisakah topik skripsi saya diselaraskan dengan karier yang saya tuju?'),
  },
  {
    id: 'product-elective',
    name: t('Digital Product Management (elective)', 'Manajemen Produk Digital (pilihan)'),
    level: 'campus',
    majors: [IS, INF, MGMT],
    semester: 7,
    credits: 3,
    skills: [{ skill: 'product-strategy', weight: 3 }, { skill: 'product-analytics', weight: 2 }, { skill: 'prd-writing', weight: 2 }, { skill: 'stakeholder', weight: 1 }],
    why: t('Roadmaps, prioritisation and metrics — the exact vocabulary of product interviews.', 'Roadmap, prioritisasi, dan metrik — kosakata yang persis dipakai di wawancara produk.'),
    project: t('Write a teardown of a product you use: its users, its key metric and one feature you would build next.', 'Tulis teardown produk yang kamu pakai: penggunanya, metrik utamanya, dan satu fitur yang akan kamu bangun berikutnya.'),
    ask: t('Could the final case be judged with the same rubric product teams use in interviews?', 'Bisakah studi kasus akhir dinilai dengan rubrik yang dipakai tim produk saat wawancara?'),
  },
  {
    id: 'internship',
    name: t('Internship / Work Placement', 'Magang / Kerja Praktik'),
    level: 'co',
    majors: 'all',
    semester: 7,
    credits: 4,
    skills: [{ skill: 'stakeholder', weight: 2 }, { skill: 'communication', weight: 2 }, { skill: 'problem-solving', weight: 2 }, { skill: 'agile', weight: 1 }],
    why: t('Credit-bearing work placements turn classroom knowledge into the experience recruiters filter for.', 'Magang yang diakui SKS mengubah ilmu di kelas menjadi pengalaman yang dicari rekruter.'),
    project: t('Keep a weekly log of one measurable thing you shipped, then turn it into two CV bullets.', 'Catat setiap minggu satu hal terukur yang kamu kerjakan, lalu ubah menjadi dua poin CV.'),
    ask: t('Could my placement report focus on one result I can also show in interviews?', 'Bisakah laporan magang saya fokus pada satu hasil yang juga bisa saya tunjukkan saat wawancara?'),
  },
  {
    id: 'capstone',
    name: t('Final Project / Thesis', 'Tugas Akhir / Skripsi'),
    level: 'campus',
    majors: 'all',
    semester: 8,
    credits: 6,
    skills: [{ skill: 'problem-solving', weight: 3 }, { skill: 'storytelling', weight: 2 }, { skill: 'statistics', weight: 1 }, { skill: 'user-research', weight: 1 }],
    why: t('Your thesis is a six-month project you can show recruiters — if its topic points at your career.', 'Skripsimu adalah proyek enam bulan yang bisa ditunjukkan ke rekruter — jika topiknya mengarah ke kariermu.'),
    project: t('Pick a thesis topic that solves a real problem in your target industry and publish a summary.', 'Pilih topik skripsi yang menyelesaikan masalah nyata di industri tujuanmu dan publikasikan ringkasannya.'),
    ask: t('Could I partner with a company or organisation for the thesis case?', 'Bisakah saya bermitra dengan perusahaan atau organisasi untuk studi kasus skripsi?'),
  },

  // ─────────────── School subjects (SMA / SMK)
  {
    id: 'sch-math',
    name: t('Mathematics', 'Matematika'),
    level: 'school',
    majors: 'all',
    semester: 0,
    credits: 0,
    skills: [{ skill: 'problem-solving', weight: 3 }, { skill: 'statistics', weight: 2 }, { skill: 'excel', weight: 1 }],
    why: t('Probability and data chapters are the first step towards data, product and engineering careers.', 'Bab peluang dan data adalah langkah pertama menuju karier data, produk, dan engineering.'),
    project: t('Survey your class about one habit and present the results with three simple charts.', 'Survei teman sekelas tentang satu kebiasaan dan sajikan hasilnya dalam tiga grafik sederhana.'),
    ask: t('Where do people use this chapter in real jobs?', 'Di pekerjaan apa bab ini dipakai sungguhan?'),
  },
  {
    id: 'sch-informatics',
    name: t('Informatics', 'Informatika'),
    level: 'school',
    majors: 'all',
    semester: 0,
    credits: 0,
    skills: [{ skill: 'problem-solving', weight: 2 }, { skill: 'python', weight: 2 }, { skill: 'data-viz', weight: 1 }, { skill: 'excel', weight: 1 }],
    why: t('Computational thinking is the entry ticket to every digital career, not only programming.', 'Berpikir komputasional adalah tiket masuk ke semua karier digital, bukan hanya programming.'),
    project: t('Build a small tool that helps your class — a quiz, a schedule or a calculator.', 'Bangun alat kecil yang membantu kelasmu — kuis, jadwal, atau kalkulator.'),
    ask: t('Which campus majors use what we learn in this subject?', 'Jurusan kuliah apa yang memakai materi pelajaran ini?'),
  },
  {
    id: 'sch-economics',
    name: t('Economics', 'Ekonomi'),
    level: 'school',
    majors: 'all',
    semester: 0,
    credits: 0,
    skills: [{ skill: 'market-research', weight: 2 }, { skill: 'product-strategy', weight: 1 }, { skill: 'statistics', weight: 1 }, { skill: 'excel', weight: 1 }],
    why: t('Supply, demand and incentives explain why products and campaigns succeed or fail.', 'Permintaan, penawaran, dan insentif menjelaskan kenapa produk dan kampanye berhasil atau gagal.'),
    project: t('Study one local shop: who buys, why, and what you would change. Present it in one page.', 'Pelajari satu toko lokal: siapa pembelinya, kenapa, dan apa yang akan kamu ubah. Sajikan dalam satu halaman.'),
    ask: t('Could we analyse a real business near school for our assignment?', 'Bisakah tugas kami menganalisis usaha nyata di sekitar sekolah?'),
  },
  {
    id: 'sch-language',
    name: t('Bahasa Indonesia & English', 'Bahasa Indonesia & Inggris'),
    level: 'school',
    majors: 'all',
    semester: 0,
    credits: 0,
    skills: [{ skill: 'communication', weight: 3 }, { skill: 'storytelling', weight: 2 }, { skill: 'content', weight: 2 }, { skill: 'public-speaking', weight: 1 }],
    why: t('Writing and speaking clearly is the skill employers mention most — in every industry.', 'Menulis dan berbicara dengan jelas adalah skill yang paling sering disebut perusahaan — di semua industri.'),
    project: t('Start a small blog or newsletter about something you love and post every two weeks.', 'Mulai blog atau newsletter kecil tentang hal yang kamu sukai dan unggah setiap dua minggu.'),
    ask: t('Could I get feedback on a personal statement or a short CV in this class?', 'Bisakah saya mendapat masukan untuk personal statement atau CV singkat di kelas ini?'),
  },
  {
    id: 'sch-art',
    name: t('Arts & Design', 'Seni Budaya & Desain'),
    level: 'school',
    majors: 'all',
    semester: 0,
    credits: 0,
    skills: [{ skill: 'ui-design', weight: 2 }, { skill: 'storytelling', weight: 2 }, { skill: 'prototyping', weight: 1 }],
    why: t('Composition and colour are the foundations of UI, branding and content work.', 'Komposisi dan warna adalah fondasi pekerjaan UI, branding, dan konten.'),
    project: t('Redesign your school’s announcement poster as a mobile-friendly post.', 'Desain ulang poster pengumuman sekolah menjadi unggahan yang ramah layar ponsel.'),
    ask: t('Can digital design count for this semester’s art project?', 'Bisakah desain digital dihitung untuk proyek seni semester ini?'),
  },
  {
    id: 'smk-rpl',
    name: t('Software Engineering (SMK)', 'Rekayasa Perangkat Lunak (SMK)'),
    level: 'school',
    majors: 'all',
    semester: 0,
    credits: 0,
    skills: [{ skill: 'javascript', weight: 2 }, { skill: 'apis', weight: 2 }, { skill: 'git', weight: 1 }, { skill: 'problem-solving', weight: 2 }],
    why: t('Vocational programming is a direct path to junior developer roles and internships.', 'Pemrograman di SMK adalah jalur langsung ke magang dan peran junior developer.'),
    project: t('Publish your PKL (internship) project on GitHub with screenshots and what you learned.', 'Publikasikan proyek PKL-mu di GitHub dengan tangkapan layar dan hal yang kamu pelajari.'),
    ask: t('Could my PKL placement match the kind of company I want to work for?', 'Bisakah tempat PKL saya sesuai dengan jenis perusahaan yang ingin saya masuki?'),
  },
];

export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.id, c]));

export const COURSE_LEVEL_LABEL: Record<CourseLevel, Text> = {
  school: { en: 'School subject', id: 'Mapel sekolah' },
  campus: { en: 'Campus course', id: 'Mata kuliah' },
  co: { en: 'Co-curricular', id: 'Ko-kurikuler' },
};

/**
 * How much of a class feeds a role, 0–100.
 * Each skill the class trains counts by how strongly the class trains it, scaled by how much the
 * role relies on that skill (core skills count fully, nice-to-haves partly).
 */
export function courseRelevance(course: Course, roleId: RoleId): number {
  const reqs = ROLE_BY_ID[roleId].requirements;
  let covered = 0;
  let total = 0;
  for (const cs of course.skills) {
    total += cs.weight;
    const r = reqs.find((x) => x.skill === cs.skill);
    if (r) covered += cs.weight * (0.55 + 0.15 * r.weight);
  }
  return total ? Math.round((covered / total) * 100) : 0;
}

export type RelevanceBand = 'core' | 'strong' | 'useful' | 'indirect';

export function relevanceBand(score: number): RelevanceBand {
  if (score >= 70) return 'core';
  if (score >= 40) return 'strong';
  if (score >= 15) return 'useful';
  return 'indirect';
}

export const BAND_LABEL: Record<RelevanceBand, Text> = {
  core: { en: 'Core for this career', id: 'Inti untuk karier ini' },
  strong: { en: 'Strong support', id: 'Pendukung kuat' },
  useful: { en: 'Useful foundation', id: 'Fondasi berguna' },
  indirect: { en: 'Indirect link', id: 'Tidak langsung' },
};

/** Every role ranked by how much this class feeds it. */
export function careersFor(course: Course) {
  return ROLES.map((r) => ({ role: r, score: courseRelevance(course, r.id) })).sort((a, b) => b.score - a.score);
}

/** Classes ranked for a role, optionally limited to a level. */
export function coursesFor(roleId: RoleId, levels: CourseLevel[] = ['campus', 'co', 'school']) {
  return COURSES.filter((c) => levels.includes(c.level))
    .map((c) => ({ course: c, score: courseRelevance(c, roleId) }))
    .sort((a, b) => b.score - a.score);
}

/** The curriculum Orbit assumes for a learner: their major's courses plus general ones. */
export function curriculumFor(major: string) {
  const inMajor = (c: Course) => Array.isArray(c.majors) && c.majors.includes(major);
  const known = COURSES.some(inMajor);
  return COURSES.filter((c) => {
    if (c.level === 'school') return false;
    if (c.majors === 'all') return true;
    // Unknown major: fall back to the broad courses most programmes share.
    return known ? inMajor(c) : c.majors.length >= 4;
  }).sort((a, b) => a.semester - b.semester || a.level.localeCompare(b.level));
}

export type CourseStatus = 'done' | 'current' | 'next';

export function courseStatus(course: Course, semester: number): CourseStatus {
  if (semester >= 9 || course.semester < semester) return 'done';
  return course.semester === semester ? 'current' : 'next';
}

export interface SkillLink {
  skill: string;
  weight: CourseSkill['weight'];
  level: Level;
  target: Level | null;
  isGap: boolean;
}

/** The skills a class trains, read against the learner's current level and the role's target. */
export function skillLinks(course: Course, profile: Profile, roleId: RoleId): SkillLink[] {
  const reqs = ROLE_BY_ID[roleId].requirements;
  return course.skills
    .map((cs) => {
      const r = reqs.find((x) => x.skill === cs.skill);
      const level = (profile.skills[cs.skill] ?? 0) as Level;
      return { skill: cs.skill, weight: cs.weight, level, target: r ? r.target : null, isGap: Boolean(r && level < r.target) };
    })
    .sort((a, b) => Number(b.target !== null) - Number(a.target !== null) || b.weight - a.weight);
}
