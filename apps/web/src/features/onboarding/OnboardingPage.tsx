import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Briefcase,
  Check,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  Orbit as OrbitIcon,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  User,
  X,
  Zap,
} from 'lucide-react';
import { Logo, ReadinessRing } from '@/components/brand/brand';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/primitives';
import { Field, Input, Range, Select } from '@/components/ui/form';
import { SkillLevelPicker } from '@/components/shared/SkillLevel';
import { IntelligenceLoader } from '@/components/shared/IntelligenceLoader';
import { LanguageToggle, ThemeToggle } from '@/components/shared/toggles';
import { ImpactPill } from '@/components/shared/layout-blocks';
import { NAYA } from '@/data/persona';
import { MAJORS, ROLES, ROLE_BY_ID, SKILL_BY_ID, UNIVERSITIES } from '@/data/catalog';
import type { Experience, ExperienceKind, Level, Profile, RoleId } from '@/data/types';
import { DIM_LONG, DIM_WHY, insightsFor, skillCoverage } from '@/engine/intelligence';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { cn, uid } from '@/lib/utils';
import { ease } from '@/lib/motion';

const BLANK: Profile = {
  name: '',
  email: '',
  headline: '',
  university: '',
  major: MAJORS[0],
  semester: 5,
  gpa: 3.4,
  targetRole: 'product-manager',
  skills: {},
  experiences: [],
  projects: [],
  portfolioUrl: '',
  portfolioArtifacts: 0,
  interviewConfidence: 3,
  mockInterviews: 0,
  interests: [],
  avatarHue: 152,
};

type Step = 'start' | 'profile' | 'goal' | 'skills' | 'analyzing' | 'result';
const FLOW: Step[] = ['profile', 'goal', 'skills'];

export default function OnboardingPage() {
  const [params] = useSearchParams();
  const isDemoLink = params.get('demo') === '1';
  const [step, setStep] = useState<Step>(isDemoLink ? 'profile' : 'start');
  const [persona, setPersona] = useState<'naya' | 'own'>('naya');
  const [profile, setProfile] = useState<Profile>(NAYA);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const complete = useOrbit((s) => s.completeOnboarding);
  const navigate = useNavigate();
  const { t, l } = useT();

  const stepIndex = FLOW.indexOf(step as (typeof FLOW)[number]);
  const go = (s: Step, d = 1) => {
    setDir(d);
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const choosePersona = (p: 'naya' | 'own') => {
    setPersona(p);
    setProfile(p === 'naya' ? NAYA : BLANK);
    go('profile');
  };

  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!profile.name.trim()) e.name = t('Tell us your name', 'Isi namamu');
    if (!profile.university.trim()) e.university = t('Add your university', 'Isi universitasmu');
    if (profile.gpa < 0 || profile.gpa > 4) e.gpa = t('GPA should be between 0 and 4', 'IPK harus antara 0 dan 4');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 'profile' && !validateProfile()) return;
    if (step === 'skills') {
      go('analyzing');
      return;
    }
    go(FLOW[stepIndex + 1]);
  };
  const back = () => (stepIndex <= 0 ? go('start', -1) : go(FLOW[stepIndex - 1], -1));

  const finishAnalysis = () => {
    const isDemo = persona === 'naya' && profile.targetRole === 'product-manager';
    complete({ ...profile, email: profile.email || `${profile.name.split(' ')[0].toLowerCase() || 'student'}@mail.com`, headline: profile.headline || `${profile.major} student · aspiring ${l(ROLE_BY_ID[profile.targetRole].name)}` }, isDemo);
    go('result');
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60 [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-green/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[480px] rounded-full bg-orange/10 blur-3xl" aria-hidden />

      <header className="relative z-10 mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label={t('Back to Orbit website', 'Kembali ke website Orbit')}>
          <Logo />
        </Link>
        {stepIndex >= 0 && (
          <ol className="hidden items-center gap-2 md:flex" aria-label={t('Progress', 'Progres')}>
            {[t('Career Profile', 'Career Profile'), t('Career Goal', 'Tujuan Karier'), t('Skills', 'Skill')].map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                <span className={cn('flex size-6 items-center justify-center rounded-full text-[11.5px] font-bold transition-colors', i < stepIndex ? 'bg-green text-white' : i === stepIndex ? 'bg-foreground text-background' : 'bg-surface-3 text-subtle-foreground')}>
                  {i < stepIndex ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn('text-[13px] font-semibold', i === stepIndex ? 'text-foreground' : 'text-subtle-foreground')}>{label}</span>
                {i < 2 && <span className="mx-1 h-px w-6 bg-border-strong" />}
              </li>
            ))}
          </ol>
        )}
        <div className="flex items-center gap-1.5">
          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle />
        </div>
      </header>

      {stepIndex >= 0 && (
        <div className="relative z-10 mx-auto h-1 max-w-6xl px-5 sm:px-8 md:hidden">
          <div className="h-1 overflow-hidden rounded-full bg-surface-3">
            <motion.div className="h-full rounded-full bg-green" animate={{ width: `${((stepIndex + 1) / FLOW.length) * 100}%` }} transition={{ duration: 0.5, ease }} />
          </div>
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-4xl px-5 pb-32 pt-8 sm:px-8 sm:pt-12">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.35, ease }}
          >
            {step === 'start' && <StartStep onChoose={choosePersona} />}
            {step === 'profile' && <ProfileStep profile={profile} setProfile={setProfile} errors={errors} persona={persona} />}
            {step === 'goal' && <GoalStep profile={profile} setProfile={setProfile} />}
            {step === 'skills' && <SkillsStep profile={profile} setProfile={setProfile} />}
            {step === 'analyzing' && (
              <div className="py-6 sm:py-12">
                <IntelligenceLoader onDone={finishAnalysis} />
              </div>
            )}
            {step === 'result' && <ResultStep onUniverse={() => navigate('/app/universe?focus=skill:product-analytics')} onToday={() => navigate('/app')} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {stepIndex >= 0 && (
        <div className="glass fixed inset-x-0 bottom-0 z-20 border-t border-border">
          <div className="safe-bottom mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft /> {t('Back', 'Kembali')}
            </Button>
            <div className="hidden text-[13px] text-muted-foreground sm:block">
              {t('Step {a} of {b}', 'Langkah {a} dari {b}', { a: stepIndex + 1, b: FLOW.length })}
            </div>
            <Button onClick={next} size="lg">
              {step === 'skills' ? (
                <>
                  <Sparkles /> {t('Analyze my career', 'Analisis karier saya')}
                </>
              ) : (
                <>
                  {t('Continue', 'Lanjut')} <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StartStep({ onChoose }: { onChoose: (p: 'naya' | 'own') => void }) {
  const { t } = useT();
  return (
    <div className="text-center">
      <Badge tone="green" className="mx-auto">
        <OrbitIcon className="size-3.5" /> {t('Build My Orbit', 'Bangun Orbit Saya')}
      </Badge>
      <h1 className="mx-auto mt-4 max-w-2xl font-display text-[34px] font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
        {t('Let’s map where you are — and where to go next.', 'Mari petakan posisimu — dan ke mana selanjutnya.')}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[16px] text-muted-foreground">
        {t('Three short steps. Orbit turns your profile into Career Intelligence, a connected Career Universe and a clear next action.', 'Tiga langkah singkat. Orbit mengubah profilmu menjadi Career Intelligence, Career Universe yang terhubung, dan aksi berikutnya yang jelas.')}
      </p>
      <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
        <motion.button
          type="button"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onChoose('naya')}
          className="group relative overflow-hidden rounded-[24px] border-2 border-green bg-surface p-6 shadow-card transition-shadow hover:shadow-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
        >
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-green/10 blur-2xl" aria-hidden />
          <Badge tone="green">{t('Recommended · 2 min tour', 'Direkomendasikan · tur 2 menit')}</Badge>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green to-[#3fc06a] font-display text-[17px] font-bold text-white shadow-green">NP</span>
            <div>
              <div className="font-display text-[19px] font-bold">{t('Explore as Naya', 'Jelajahi sebagai Naya')}</div>
              <div className="text-[13.5px] text-muted-foreground">{t('Final-year student · aspiring Product Manager', 'Mahasiswa tingkat akhir · calon Product Manager')}</div>
            </div>
          </div>
          <p className="mt-4 text-[14px] text-muted-foreground">{t('A complete profile is pre-filled so you can experience every part of Orbit instantly.', 'Profil lengkap sudah terisi sehingga kamu bisa langsung merasakan semua bagian Orbit.')}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-green-strong dark:text-green">
            {t('Start the tour', 'Mulai tur')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onChoose('own')}
          className="group relative overflow-hidden rounded-[24px] border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
        >
          <Badge tone="neutral">{t('About 3 minutes', 'Sekitar 3 menit')}</Badge>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted-orange text-orange-strong dark:text-orange">
              <User className="size-5" />
            </span>
            <div>
              <div className="font-display text-[19px] font-bold">{t('Build my own Orbit', 'Bangun Orbit saya sendiri')}</div>
              <div className="text-[13.5px] text-muted-foreground">{t('Start from your real profile', 'Mulai dari profil aslimu')}</div>
            </div>
          </div>
          <p className="mt-4 text-[14px] text-muted-foreground">{t('Add your studies, experience, projects and skills. Your data stays in this browser.', 'Tambahkan studi, pengalaman, proyek, dan skill-mu. Datamu tetap tersimpan di browser ini.')}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
            {t('Start from scratch', 'Mulai dari awal')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}

function StepTitle({ icon: Icon, eyebrow, title, desc }: { icon: typeof User; eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-green-strong dark:text-green">
        <Icon className="size-4" /> {eyebrow}
      </div>
      <h1 className="mt-2 font-display text-[30px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[38px]">{title}</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function ProfileStep({ profile, setProfile, errors, persona }: { profile: Profile; setProfile: (p: Profile) => void; errors: Record<string, string>; persona: 'naya' | 'own' }) {
  const { t } = useT();
  const [exp, setExp] = useState<{ title: string; org: string; kind: ExperienceKind }>({ title: '', org: '', kind: 'internship' });
  const [proj, setProj] = useState('');
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setProfile({ ...profile, [k]: v });
  const KINDS: { v: ExperienceKind; l: string }[] = [
    { v: 'internship', l: t('Internship', 'Magang') },
    { v: 'organization', l: t('Organization', 'Organisasi') },
    { v: 'part-time', l: t('Part-time', 'Part-time') },
    { v: 'competition', l: t('Competition', 'Kompetisi') },
    { v: 'volunteer', l: t('Volunteer', 'Relawan') },
  ];

  return (
    <div>
      <StepTitle
        icon={User}
        eyebrow={t('Step 1 · Career Profile', 'Langkah 1 · Career Profile')}
        title={persona === 'naya' ? t('Meet Naya’s Career Profile', 'Kenalan dengan Career Profile Naya') : t('Tell Orbit about you', 'Ceritakan dirimu ke Orbit')}
        desc={t('Your studies, experiences and projects become evidence Orbit can measure. Edit anything you like.', 'Studi, pengalaman, dan proyekmu menjadi bukti yang bisa diukur Orbit. Ubah apa saja sesukamu.')}
      />
      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 font-display text-[16px] font-bold">
            <GraduationCap className="size-[18px] text-green" /> {t('Education', 'Pendidikan')}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('Full name', 'Nama lengkap')} htmlFor="ob-name" error={errors.name}>
              <Input id="ob-name" value={profile.name} aria-invalid={Boolean(errors.name)} onChange={(e) => set('name', e.target.value)} placeholder="Naya Prameswari" autoComplete="name" />
            </Field>
            <Field label={t('University', 'Universitas')} htmlFor="ob-uni" error={errors.university}>
              <Input id="ob-uni" list="ob-unis" value={profile.university} aria-invalid={Boolean(errors.university)} onChange={(e) => set('university', e.target.value)} placeholder={t('Your university', 'Universitasmu')} />
              <datalist id="ob-unis">
                {UNIVERSITIES.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </Field>
            <Field label={t('Major', 'Jurusan')} htmlFor="ob-major">
              <Select id="ob-major" value={profile.major} onChange={(e) => set('major', e.target.value)}>
                {MAJORS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('Semester', 'Semester')} htmlFor="ob-sem">
                <Select id="ob-sem" value={profile.semester} onChange={(e) => set('semester', Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value={9}>{t('Graduated', 'Lulus')}</option>
                </Select>
              </Field>
              <Field label={t('GPA', 'IPK')} htmlFor="ob-gpa" error={errors.gpa}>
                <Input id="ob-gpa" type="number" step="0.01" min={0} max={4} value={profile.gpa} aria-invalid={Boolean(errors.gpa)} onChange={(e) => set('gpa', Number(e.target.value))} />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2 font-display text-[16px] font-bold">
            <Briefcase className="size-[18px] text-green" /> {t('Experience', 'Pengalaman')}
          </div>
          <p className="mb-4 text-[13.5px] text-muted-foreground">{t('Internships, organisations, part-time work and competitions all count.', 'Magang, organisasi, kerja part-time, dan kompetisi semuanya dihitung.')}</p>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {profile.experiences.map((e) => (
                <motion.li key={e.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-3.5 py-2.5">
                  <Badge tone={e.kind === 'internship' ? 'green' : e.kind === 'organization' ? 'info' : 'neutral'}>{KINDS.find((k) => k.v === e.kind)?.l}</Badge>
                  <div className="min-w-0 flex-1 truncate text-[14px]">
                    <span className="font-semibold">{e.title}</span> <span className="text-muted-foreground">· {e.org}</span>
                  </div>
                  <button type="button" aria-label={t('Remove', 'Hapus')} onClick={() => set('experiences', profile.experiences.filter((x) => x.id !== e.id))} className="flex size-7 items-center justify-center rounded-lg text-subtle-foreground transition hover:bg-muted-danger hover:text-danger">
                    <X className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <form
            className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_150px_auto]"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!exp.title.trim() || !exp.org.trim()) return;
              const item: Experience = { id: uid('e'), title: exp.title.trim(), org: exp.org.trim(), kind: exp.kind, period: new Date().getFullYear().toString() };
              set('experiences', [...profile.experiences, item]);
              setExp({ title: '', org: '', kind: exp.kind });
            }}
          >
            <Input aria-label={t('Role or title', 'Peran atau jabatan')} placeholder={t('Role, e.g. Marketing Intern', 'Peran, mis. Marketing Intern')} value={exp.title} onChange={(e) => setExp({ ...exp, title: e.target.value })} />
            <Input aria-label={t('Organization', 'Organisasi')} placeholder={t('Organization', 'Organisasi')} value={exp.org} onChange={(e) => setExp({ ...exp, org: e.target.value })} />
            <Select aria-label={t('Type', 'Jenis')} value={exp.kind} onChange={(e) => setExp({ ...exp, kind: e.target.value as ExperienceKind })}>
              {KINDS.map((k) => (
                <option key={k.v} value={k.v}>
                  {k.l}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary" disabled={!exp.title.trim() || !exp.org.trim()}>
              <Plus /> {t('Add', 'Tambah')}
            </Button>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-1 flex items-center gap-2 font-display text-[16px] font-bold">
            <FolderKanban className="size-[18px] text-green" /> {t('Projects & portfolio', 'Proyek & portofolio')}
          </div>
          <p className="mb-4 text-[13.5px] text-muted-foreground">{t('Class projects, side projects and hackathons are strong evidence.', 'Proyek kelas, side project, dan hackathon adalah bukti yang kuat.')}</p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {profile.projects.map((p) => (
                <motion.span key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2/60 py-1.5 pl-3.5 pr-1.5 text-[13.5px] font-medium">
                  {p.title}
                  <button type="button" aria-label={t('Remove {p}', 'Hapus {p}', { p: p.title })} onClick={() => set('projects', profile.projects.filter((x) => x.id !== p.id))} className="flex size-6 items-center justify-center rounded-full text-subtle-foreground transition hover:bg-muted-danger hover:text-danger">
                    <X className="size-3.5" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!proj.trim()) return;
              set('projects', [...profile.projects, { id: uid('p'), title: proj.trim(), description: '', skills: [] }]);
              setProj('');
            }}
          >
            <Input aria-label={t('Project name', 'Nama proyek')} placeholder={t('Project name, e.g. Campus Event App', 'Nama proyek, mis. Aplikasi Event Kampus')} value={proj} onChange={(e) => setProj(e.target.value)} />
            <Button type="submit" variant="secondary" disabled={!proj.trim()}>
              <Plus /> {t('Add', 'Tambah')}
            </Button>
          </form>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={t('Portfolio link (optional)', 'Link portofolio (opsional)')} htmlFor="ob-port">
              <Input id="ob-port" value={profile.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} placeholder="yourname.notion.site" />
            </Field>
            <Field label={t('Published case studies', 'Studi kasus yang dipublikasikan')} htmlFor="ob-art">
              <Select id="ob-art" value={profile.portfolioArtifacts} onChange={(e) => set('portfolioArtifacts', Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}

function GoalStep({ profile, setProfile }: { profile: Profile; setProfile: (p: Profile) => void }) {
  const { t, l } = useT();
  const fits = useMemo(() => Object.fromEntries(ROLES.map((r) => [r.id, Math.round(skillCoverage(profile, r.id))])), [profile]);
  const best = ROLES.reduce((a, b) => (fits[b.id] > fits[a.id] ? b : a)).id;
  return (
    <div>
      <StepTitle
        icon={Target}
        eyebrow={t('Step 2 · Career Goal', 'Langkah 2 · Tujuan Karier')}
        title={t('Which career do you dream of first?', 'Karier impian mana yang kamu tuju dulu?')}
        desc={t('This becomes your first orbit. Dreaming of more than one career? Add more dream orbits anytime inside Orbit.', 'Ini menjadi orbit pertamamu. Punya lebih dari satu impian karier? Tambahkan orbit impian lain kapan saja di dalam Orbit.')}
      />
      <div role="radiogroup" aria-label={t('Target role', 'Peran target')} className="grid gap-3 sm:grid-cols-2">
        {ROLES.map((r, i) => {
          const active = profile.targetRole === r.id;
          return (
            <motion.button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease }}
              onClick={() => setProfile({ ...profile, targetRole: r.id as RoleId })}
              className={cn(
                'group relative overflow-hidden rounded-[20px] border-2 bg-surface p-5 text-left transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]',
                active ? 'border-green shadow-card' : 'border-border',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[17px] font-bold">{l(r.name)}</span>
                    {r.id === best && <Badge tone="orange">{t('Best fit', 'Paling cocok')}</Badge>}
                  </div>
                  <div className="mt-1 text-[13.5px] text-muted-foreground">{l(r.tagline)}</div>
                </div>
                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition', active ? 'border-green bg-green text-white' : 'border-border-strong')}>
                  {active && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <motion.div className="h-full rounded-full bg-green" initial={{ width: 0 }} animate={{ width: `${fits[r.id]}%` }} transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.05 }} />
                </div>
                <span className="tabular text-[12.5px] font-bold">{fits[r.id]}%</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[12.5px] text-muted-foreground">
                <span>{t('Skill match', 'Kecocokan skill')}</span>
                <span>{t('{n} openings', '{n} lowongan', { n: r.openings })}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SkillsStep({ profile, setProfile }: { profile: Profile; setProfile: (p: Profile) => void }) {
  const { t, l } = useT();
  const role = ROLE_BY_ID[profile.targetRole];
  const setLevel = (skill: string, lv: Level) => setProfile({ ...profile, skills: { ...profile.skills, [skill]: lv } });
  return (
    <div>
      <StepTitle
        icon={BarChart3}
        eyebrow={t('Step 3 · Skills', 'Langkah 3 · Skill')}
        title={t('How strong are you in what {role} needs?', 'Seberapa kuat kamu di skill yang dibutuhkan {role}?', { role: l(role.name) })}
        desc={t('Be honest — Orbit uses this to find the gaps that matter most. A dot marks the level most openings expect.', 'Jujur saja — Orbit memakai ini untuk menemukan gap terpenting. Titik menandai level yang diharapkan sebagian besar lowongan.')}
      />
      <Card className="divide-y divide-border">
        {role.requirements.map((r) => {
          const lv = (profile.skills[r.skill] ?? 0) as Level;
          const gap = lv < r.target;
          return (
            <div key={r.skill} className="grid gap-3 p-4 sm:grid-cols-[1fr_minmax(0,380px)] sm:items-center sm:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14.5px] font-semibold">{l(SKILL_BY_ID[r.skill].name)}</span>
                  {r.weight === 3 && <Badge tone="neutral">{t('Core', 'Inti')}</Badge>}
                  {gap ? <Badge tone="orange">{t('Gap', 'Gap')}</Badge> : <Badge tone="green">{t('On target', 'Sesuai target')}</Badge>}
                </div>
                <div className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">{l(SKILL_BY_ID[r.skill].description)}</div>
              </div>
              <SkillLevelPicker value={lv} target={r.target} onChange={(v) => setLevel(r.skill, v)} label={l(SKILL_BY_ID[r.skill].name)} />
            </div>
          );
        })}
      </Card>
      <Card className="mt-5 grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="ob-conf" className="text-[14px] font-semibold">
              {t('Interview confidence', 'Kepercayaan diri wawancara')}
            </label>
            <span className="tabular text-[13px] font-bold text-green-strong dark:text-green">{profile.interviewConfidence}/5</span>
          </div>
          <Range id="ob-conf" min={1} max={5} value={profile.interviewConfidence} onChange={(v) => setProfile({ ...profile, interviewConfidence: v })} label={t('Interview confidence', 'Kepercayaan diri wawancara')} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="ob-mock" className="text-[14px] font-semibold">
              {t('Mock interviews done', 'Mock interview yang pernah dilakukan')}
            </label>
            <span className="tabular text-[13px] font-bold text-green-strong dark:text-green">{profile.mockInterviews}</span>
          </div>
          <Range id="ob-mock" min={0} max={6} value={profile.mockInterviews} onChange={(v) => setProfile({ ...profile, mockInterviews: v })} label={t('Mock interviews done', 'Mock interview yang pernah dilakukan')} />
        </div>
      </Card>
    </div>
  );
}

function ResultStep({ onUniverse, onToday }: { onUniverse: () => void; onToday: () => void }) {
  const profile = useOrbit((s) => s.profile);
  const quests = useOrbit((s) => s.quests);
  const { t, l } = useT();
  if (!profile) return null;
  const ins = insightsFor(profile, quests);
  const role = ROLE_BY_ID[profile.targetRole];
  const opp = ins.opportunity;
  const cards = [
    { icon: Award, tone: 'green', label: t('Top strength', 'Kekuatan utama'), value: l(DIM_LONG[ins.strength.dim]), score: ins.strength.score, why: l(DIM_WHY[ins.strength.dim]) },
    { icon: TrendingUp, tone: 'orange', label: t('Priority gap', 'Gap prioritas'), value: l(DIM_LONG[ins.priorityGap.dim]), score: ins.priorityGap.score, why: l(DIM_WHY[ins.priorityGap.dim]) },
    opp && {
      icon: Lightbulb,
      tone: 'green',
      label: t('Biggest opportunity', 'Peluang terbesar'),
      value: l(SKILL_BY_ID[opp.skill].name),
      score: undefined,
      why: t('Improving {s} could unlock {n} relevant opportunities matching your profile.', 'Meningkatkan {s} bisa membuka {n} peluang relevan yang cocok dengan profilmu.', { s: l(SKILL_BY_ID[opp.skill].name), n: opp.demand }),
    },
  ].filter(Boolean) as { icon: typeof Award; tone: string; label: string; value: string; score?: number; why: string }[];

  return (
    <div>
      <div className="text-center">
        <Badge tone="green">
          <Sparkles className="size-3.5" /> {t('Career Intelligence ready', 'Career Intelligence siap')}
        </Badge>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-[30px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[40px]">
          {t('{n}, you are {r}% ready for {role}.', '{n}, kamu {r}% siap untuk {role}.', { n: profile.name.split(' ')[0], r: Math.round(ins.readiness), role: l(role.name) })}
        </h1>
      </div>
      <Card className="mt-8 overflow-hidden">
        <div className="grid items-center gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <ReadinessRing score={ins.readiness} size={196} stroke={14} />
          </div>
          <div className="space-y-3">
            {cards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.12, duration: 0.4, ease }} className="rounded-2xl border border-border bg-surface-2/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <c.icon className={cn('size-[18px]', c.tone === 'orange' ? 'text-orange' : 'text-green')} />
                    <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{c.label}</span>
                  </div>
                  {c.score !== undefined && <span className="tabular text-[14px] font-bold">{Math.round(c.score)}%</span>}
                </div>
                <div className="mt-1.5 font-display text-[17px] font-bold">{c.value}</div>
                <p className="mt-0.5 text-[13.5px] text-muted-foreground">{c.why}</p>
              </motion.div>
            ))}
          </div>
        </div>
        {opp && (
          <div className="flex flex-col gap-4 border-t border-border bg-gradient-to-r from-mint to-cream p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange text-white shadow-orange">
                <Zap className="size-5" />
              </span>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-orange-strong dark:text-orange">{t('Next Best Action', 'Next Best Action')}</div>
                <div className="font-display text-[16px] font-bold">{opp.course ? t('Complete {c}', 'Selesaikan {c}', { c: opp.course.title }) : l(SKILL_BY_ID[opp.skill].name)}</div>
                <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
                  {t('Estimated readiness impact', 'Perkiraan dampak kesiapan')} <ImpactPill value={opp.impact} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={onUniverse}>
          <OrbitIcon /> {t('Explore my Career Universe', 'Jelajahi Career Universe saya')}
        </Button>
        <Button size="lg" variant="secondary" onClick={onToday}>
          {t('Go to Today', 'Ke halaman Today')} <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
