import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo, OrbitMark } from '@/components/brand/brand';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { LanguageToggle, ThemeToggle } from '@/components/shared/toggles';
import { useOrbit } from '@/store/orbit';
import { useT } from '@/lib/i18n';
import { ease } from '@/lib/motion';

export default function SignInPage() {
  const mode = useOrbit((s) => s.mode);
  const loadDemo = useOrbit((s) => s.loadDemo);
  const profile = useOrbit((s) => s.profile);
  const navigate = useNavigate();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = t('Enter a valid email address', 'Masukkan alamat email yang valid');
    if (password.length < 6) e.password = t('Password must be at least 6 characters', 'Password minimal 6 karakter');
    if (!e.email && mode !== 'none' && profile?.email && profile.email.toLowerCase() !== email.trim().toLowerCase())
      e.email = t('No Orbit on this device uses this email. Try {m}, or build a new Orbit.', 'Tidak ada Orbit di perangkat ini dengan email tersebut. Coba {m}, atau bangun Orbit baru.', { m: profile.email });
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      if (mode === 'none') {
        toast(t('No Orbit on this device yet', 'Belum ada Orbit di perangkat ini'), { description: t('Let’s build yours — it takes about two minutes.', 'Ayo bangun Orbit-mu — hanya sekitar dua menit.') });
        navigate('/start');
      } else {
        toast.success(t('Welcome back, {n}', 'Selamat datang kembali, {n}', { n: profile?.name.split(' ')[0] ?? '' }));
        navigate('/app');
      }
    }, 600);
  };

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0d1813] p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-32 top-20 size-[460px] rounded-full bg-green/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 right-0 size-[420px] rounded-full bg-orange/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden />
        <Link to="/" className="relative inline-flex items-center gap-2.5">
          <OrbitMark />
          <span className="font-display text-[19px] font-extrabold tracking-tight">Orbit</span>
        </Link>
        <div className="relative my-auto">
          <div className="relative mx-auto mb-12 size-[300px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="absolute rounded-full border border-dashed border-white/15" style={{ inset: i * 42 }} animate={{ rotate: i % 2 ? -360 : 360 }} transition={{ duration: 50 + i * 20, repeat: Infinity, ease: 'linear' }}>
                <span className={`absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full ${i === 1 ? 'bg-orange' : 'bg-green'}`} />
              </motion.div>
            ))}
            <div className="orbit-gradient absolute inset-[118px] flex items-center justify-center rounded-full font-display text-[13px] font-bold shadow-[0_0_60px_rgba(10,180,106,0.6)]">{t('YOU', 'KAMU')}</div>
          </div>
          <blockquote className="max-w-md font-display text-[30px] font-bold leading-tight tracking-[-0.02em]">{t('Your career is not a straight line.', 'Kariermu bukan garis lurus.')}</blockquote>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
            {t('It is an orbit of skills, experiences, people, knowledge and opportunities. Welcome back to yours.', 'Ia adalah orbit dari skill, pengalaman, orang, pengetahuan, dan peluang. Selamat datang kembali di orbit-mu.')}
          </p>
        </div>
        <p className="relative text-[12.5px] text-white/40">Smart Education & Campus Innovation · SDG 4</p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="size-4" /> {t('Back', 'Kembali')}
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="mx-auto my-auto w-full max-w-[400px] py-10">
          <Logo className="mb-8 lg:hidden" />
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.03em]">{t('Welcome back', 'Selamat datang kembali')}</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">{t('Sign in to continue your journey.', 'Masuk untuk melanjutkan journey-mu.')}</p>

          <Button
            size="lg"
            variant="gradient"
            className="mt-8 w-full"
            onClick={() => {
              if (mode === 'none') loadDemo();
              navigate('/app');
            }}
          >
            <Sparkles /> {mode === 'none' ? t('Continue with Naya’s demo account', 'Lanjutkan dengan akun demo Naya') : t('Continue to my Orbit', 'Lanjutkan ke Orbit saya')}
          </Button>
          <div className="my-6 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-wider text-subtle-foreground">
            <span className="h-px flex-1 bg-border" /> {t('or with email', 'atau dengan email')} <span className="h-px flex-1 bg-border" />
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="space-y-4"
          >
            <Field label="Email" htmlFor="si-email" error={errors.email}>
              <Input id="si-email" type="email" autoComplete="email" value={email} aria-invalid={Boolean(errors.email)} onChange={(e) => setEmail(e.target.value)} placeholder="you@campus.ac.id" />
            </Field>
            <Field label={t('Password', 'Password')} htmlFor="si-pass" error={errors.password}>
              <div className="relative">
                <Input id="si-pass" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} aria-invalid={Boolean(errors.password)} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? t('Hide password', 'Sembunyikan password') : t('Show password', 'Tampilkan password')} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-subtle-foreground transition hover:bg-surface-2 hover:text-foreground">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {t('Sign in', 'Masuk')} {!loading && <ArrowRight />}
            </Button>
          </form>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface-2/70 px-3 py-2.5 text-[12.5px] leading-snug text-muted-foreground">
            <ShieldCheck className="mt-px size-4 shrink-0 text-green" aria-hidden />
            {t('Your Orbit is stored privately in this browser. Nothing leaves your device.', 'Orbit-mu tersimpan privat di browser ini. Tidak ada data yang keluar dari perangkatmu.')}
          </p>
          <p className="mt-6 text-center text-[14px] text-muted-foreground">
            {t('New to Orbit?', 'Baru di Orbit?')}{' '}
            <Link to="/start" className="font-semibold text-green-strong hover:underline dark:text-green">
              {t('Build your Orbit', 'Bangun Orbit-mu')}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
