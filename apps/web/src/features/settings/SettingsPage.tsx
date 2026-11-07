import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Bell, Check, Download, Laptop, LogOut, Moon, Palette, RotateCcw, Save, Sun, Target, User, Layers, Database } from 'lucide-react';
import { PageHeader, SectionHeader } from '@/components/shared/layout-blocks';
import { Avatar, Badge, Card } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Switch } from '@/components/ui/form';
import { Segmented } from '@/components/ui/tabs';
import { ReadinessRing } from '@/components/brand/brand';
import { SkillLevelPicker } from '@/components/shared/SkillLevel';
import { LanguageToggle } from '@/components/shared/toggles';
import { useOrbit, useInsights } from '@/store/orbit';
import { useUi, type ThemePreference } from '@/store/ui';
import { requestReset } from '@/store/actions';
import { MAJORS, ROLES, ROLE_BY_ID, SKILL_BY_ID } from '@/data/catalog';
import type { Level, RoleId } from '@/data/types';
import { skillCoverage } from '@/engine/intelligence';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ease } from '@/lib/motion';

const PREFS_KEY = 'orbit.notifyPrefs';

export default function SettingsPage() {
  const profile = useOrbit((s) => s.profile)!;
  const updateProfile = useOrbit((s) => s.updateProfile);
  const signOut = useOrbit((s) => s.signOut);
  const mode = useOrbit((s) => s.mode);
  const insights = useInsights()!;
  const theme = useUi((s) => s.theme);
  const setTheme = useUi((s) => s.setTheme);
  const askConfirm = useUi((s) => s.askConfirm);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t, l } = useT();

  const [form, setForm] = useState({ name: profile.name, email: profile.email, headline: profile.headline, university: profile.university, major: profile.major, semester: profile.semester, gpa: profile.gpa });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(form) !== JSON.stringify({ name: profile.name, email: profile.email, headline: profile.headline, university: profile.university, major: profile.major, semester: profile.semester, gpa: profile.gpa });
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '') as Record<string, boolean>;
    } catch {
      return { deadlines: true, weekly: true, opportunities: true, mentors: false };
    }
  });
  useEffect(() => localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)), [prefs]);

  useEffect(() => {
    const r = params.get('role');
    if (r) document.getElementById('career-goal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [params]);

  const saveProfile = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t('Name is required', 'Nama wajib diisi');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = t('Enter a valid email', 'Masukkan email yang valid');
    if (form.gpa < 0 || form.gpa > 4) e.gpa = t('GPA must be 0–4', 'IPK harus 0–4');
    setErrors(e);
    if (Object.keys(e).length) return;
    updateProfile({ ...form, name: form.name.trim() });
    toast.success(t('Profile updated', 'Profil diperbarui'));
  };

  const changeRole = (id: RoleId) => {
    if (id === profile.targetRole) return;
    askConfirm({
      title: t('Change the goal of this orbit?', 'Ganti tujuan orbit ini?'),
      description: t(
        'Orbit recalculates readiness, gaps and recommendations for the new role; this orbit’s journey stays. Want to keep this dream too? Use “New dream orbit” in the top bar instead.',
        'Orbit menghitung ulang kesiapan, gap, dan rekomendasi untuk peran baru; journey orbit ini tetap. Ingin tetap menyimpan impian ini? Pakai “Orbit impian baru” di bar atas.',
      ),
      items: [{ label: l(ROLE_BY_ID[id].name), meta: l(ROLE_BY_ID[id].tagline) }],
      icon: 'journey',
      confirmLabel: t('Change goal', 'Ganti tujuan'),
      onConfirm: () => {
        updateProfile({ targetRole: id });
        toast.success(t('Career goal updated', 'Tujuan karier diperbarui'), { description: l(ROLE_BY_ID[id].name) });
      },
    });
  };

  const exportData = () => {
    const data = useOrbit.getState();
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile: data.profile, orbits: data.orbits, materials: data.materials, quests: data.quests, saved: data.saved, reminders: data.reminders, journal: data.journal, activity: data.activity, xp: data.xp }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbit-${profile.name.split(' ')[0].toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('Your Orbit data was exported', 'Data Orbit-mu berhasil diekspor'));
  };

  const role = ROLE_BY_ID[profile.targetRole];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('Profile & settings', 'Profil & pengaturan')} title={t('Your Orbit, your way', 'Orbit-mu, caramu')} description={t('Changes update your Career Intelligence instantly.', 'Perubahan langsung memperbarui Career Intelligence-mu.')} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Profile */}
          <Card className="p-5 sm:p-6">
            <SectionHeader icon={User} title={t('Career Profile', 'Career Profile')} description={t('The basics Orbit uses to understand you.', 'Data dasar yang dipakai Orbit untuk memahamimu.')} />
            <div className="mb-5 flex items-center gap-4">
              <Avatar name={form.name || profile.name} hue={profile.avatarHue} size={60} />
              <div className="min-w-0">
                <div className="truncate font-display text-[18px] font-bold">{form.name || profile.name}</div>
                <div className="truncate text-[13.5px] text-muted-foreground">{form.headline}</div>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile();
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Field label={t('Full name', 'Nama lengkap')} htmlFor="s-name" error={errors.name}>
                <Input id="s-name" value={form.name} aria-invalid={Boolean(errors.name)} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </Field>
              <Field label={t('Email', 'Email')} htmlFor="s-email" error={errors.email}>
                <Input id="s-email" type="email" value={form.email} aria-invalid={Boolean(errors.email)} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
              </Field>
              <Field label={t('Headline', 'Headline')} htmlFor="s-head" className="sm:col-span-2">
                <Input id="s-head" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
              </Field>
              <Field label={t('University', 'Universitas')} htmlFor="s-uni">
                <Input id="s-uni" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} />
              </Field>
              <Field label={t('Major', 'Jurusan')} htmlFor="s-major">
                <Select id="s-major" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })}>
                  {[...new Set([form.major, ...MAJORS])].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
              </Field>
              <Field label={t('Semester', 'Semester')} htmlFor="s-sem">
                <Select id="s-sem" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value={9}>{t('Graduated', 'Lulus')}</option>
                </Select>
              </Field>
              <Field label={t('GPA', 'IPK')} htmlFor="s-gpa" error={errors.gpa}>
                <Input id="s-gpa" type="number" step="0.01" min={0} max={4} value={form.gpa} aria-invalid={Boolean(errors.gpa)} onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} />
              </Field>
              <div className="flex justify-end gap-2 sm:col-span-2">
                {dirty && (
                  <Button variant="ghost" onClick={() => setForm({ name: profile.name, email: profile.email, headline: profile.headline, university: profile.university, major: profile.major, semester: profile.semester, gpa: profile.gpa })}>
                    {t('Discard', 'Batalkan')}
                  </Button>
                )}
                <Button type="submit" disabled={!dirty}>
                  <Save /> {t('Save profile', 'Simpan profil')}
                </Button>
              </div>
            </form>
          </Card>

          {/* Goal */}
          <Card id="career-goal" className="scroll-mt-24 p-5 sm:p-6">
            <SectionHeader icon={Target} title={t('Career goal', 'Tujuan karier')} description={t('Orbit measures readiness against this role.', 'Orbit mengukur kesiapan terhadap peran ini.')} />
            <div role="radiogroup" aria-label={t('Career goal', 'Tujuan karier')} className="grid gap-2.5 sm:grid-cols-2">
              {ROLES.map((r) => {
                const active = r.id === profile.targetRole;
                const highlighted = params.get('role') === r.id && !active;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => changeRole(r.id)}
                    className={cn('flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition hover:border-border-strong', active ? 'border-green bg-muted-green/40' : highlighted ? 'border-orange/60' : 'border-border')}
                  >
                    <div className="min-w-0">
                      <div className="font-display text-[15px] font-bold">{l(r.name)}</div>
                      <div className="text-[12.5px] text-muted-foreground">{t('Skill match {s}%', 'Kecocokan skill {s}%', { s: Math.round(skillCoverage(profile, r.id)) })}</div>
                    </div>
                    <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border-2', active ? 'border-green bg-green text-white' : 'border-border-strong')}>{active && <Check className="size-3.5" strokeWidth={3} />}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-5 sm:p-6">
            <SectionHeader icon={Layers} title={t('Skills for {r}', 'Skill untuk {r}', { r: l(role.name) })} description={t('Update a level and watch your readiness respond.', 'Ubah level dan lihat kesiapanmu berubah.')} />
            <div className="divide-y divide-border">
              {role.requirements.map((r) => (
                <div key={r.skill} className="grid gap-2.5 py-3.5 sm:grid-cols-[1fr_minmax(0,360px)] sm:items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold">{l(SKILL_BY_ID[r.skill].name)}</span>
                    {(profile.skills[r.skill] ?? 0) < r.target && <Badge tone="orange">{t('Gap', 'Gap')}</Badge>}
                  </div>
                  <SkillLevelPicker value={(profile.skills[r.skill] ?? 0) as Level} target={r.target} label={l(SKILL_BY_ID[r.skill].name)} onChange={(v) => updateProfile({ skills: { ...profile.skills, [r.skill]: v } })} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="flex flex-col items-center p-6 text-center">
            <ReadinessRing score={insights.readiness} size={150} stroke={11} />
            <div className="mt-3 font-display text-[16px] font-bold">{l(role.name)}</div>
            <p className="mt-1 text-[12.5px] text-muted-foreground">{t('Live Career Readiness — updates as you edit.', 'Career Readiness langsung — berubah saat kamu mengedit.')}</p>
          </Card>

          <Card className="p-5">
            <SectionHeader icon={Palette} title={t('Appearance', 'Tampilan')} className="mb-3" />
            <Segmented<ThemePreference>
              full
              size="sm"
              label={t('Theme', 'Tema')}
              value={theme}
              onChange={(v) => setTheme(v)}
              options={[
                { value: 'light', label: t('Light', 'Terang'), icon: Sun },
                { value: 'dark', label: t('Dark', 'Gelap'), icon: Moon },
                { value: 'system', label: t('System', 'Sistem'), icon: Laptop },
              ]}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[14px] font-semibold">{t('Language', 'Bahasa')}</span>
              <LanguageToggle />
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader icon={Bell} title={t('Notifications', 'Notifikasi')} className="mb-2" />
            {[
              { k: 'deadlines', label: t('Application deadlines', 'Deadline lamaran') },
              { k: 'opportunities', label: t('New matching opportunities', 'Peluang baru yang cocok') },
              { k: 'weekly', label: t('Weekly review', 'Weekly review') },
              { k: 'mentors', label: t('Mentor availability', 'Ketersediaan mentor') },
            ].map((p) => (
              <div key={p.k} className="flex items-center justify-between py-2.5">
                <label htmlFor={`pref-${p.k}`} className="text-[14px]">
                  {p.label}
                </label>
                <Switch id={`pref-${p.k}`} checked={Boolean(prefs[p.k])} onChange={(v) => setPrefs({ ...prefs, [p.k]: v })} label={p.label} />
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <SectionHeader icon={Database} title={t('Your data', 'Datamu')} description={t('Stored privately in this browser.', 'Tersimpan privat di browser ini.')} className="mb-3" />
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={exportData}>
                <Download /> {t('Export my data (JSON)', 'Ekspor data saya (JSON)')}
              </Button>
              {mode === 'demo' && (
                <Button variant="secondary" className="w-full justify-start" onClick={() => requestReset(() => navigate('/app'))}>
                  <RotateCcw /> {t('Reset demo data', 'Reset data demo')}
                </Button>
              )}
              <Button
                variant="danger-soft"
                className="w-full justify-start"
                onClick={() =>
                  askConfirm({
                    title: t('Sign out of Orbit?', 'Keluar dari Orbit?'),
                    description: t('Your data in this browser will be cleared.', 'Datamu di browser ini akan dihapus.'),
                    icon: 'delete',
                    tone: 'danger',
                    confirmLabel: t('Sign out', 'Keluar'),
                    onConfirm: () => {
                      signOut();
                      navigate('/');
                    },
                  })
                }
              >
                <LogOut /> {t('Sign out', 'Keluar')}
              </Button>
            </div>
          </Card>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, ease }} className="text-center text-[12px] text-subtle-foreground">
            Orbit · Smart Education & Campus Innovation · SDG 4
          </motion.p>
        </div>
      </div>
    </div>
  );
}
