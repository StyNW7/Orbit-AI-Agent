import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Link, Navigate, Outlet, RouterProvider, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';
import { Compass } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/overlays';
import { ConfirmHost } from '@/components/shared/ConfirmHost';
import { EmptyState } from '@/components/shared/layout-blocks';
import { Button } from '@/components/ui/button';
import { OrbitMark } from '@/components/brand/brand';
import { useOrbit } from '@/store/orbit';
import { useIsDark } from '@/store/ui';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-media';

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const WhyOrbitPage = lazy(() => import('@/features/why/WhyOrbitPage'));
const CampusPage = lazy(() => import('@/features/campus/CampusPage'));
const SignInPage = lazy(() => import('@/features/auth/SignInPage'));
const OnboardingPage = lazy(() => import('@/features/onboarding/OnboardingPage'));
const AppShell = lazy(() => import('@/components/layout/AppShell'));
const TodayPage = lazy(() => import('@/features/today/TodayPage'));
const IntelligencePage = lazy(() => import('@/features/intelligence/IntelligencePage'));
const LearnPage = lazy(() => import('@/features/learning/LearnPage'));
const UniversePage = lazy(() => import('@/features/universe/UniversePage'));
const JourneyPage = lazy(() => import('@/features/journey/JourneyPage'));
const DiscoverPage = lazy(() => import('@/features/discover/DiscoverPage'));
const ProgressPage = lazy(() => import('@/features/progress/ProgressPage'));
const JournalPage = lazy(() => import('@/features/journal/JournalPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background" role="status" aria-label="Loading Orbit">
      <div className="relative">
        <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-green/30" aria-hidden />
        <OrbitMark className="relative size-14 drop-shadow-[0_12px_28px_rgba(10,180,106,0.35)]" animated />
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="space-y-5 p-1" aria-hidden>
      <div className="skeleton h-9 w-72" />
      <div className="skeleton h-5 w-96 max-w-full" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="skeleton h-56 lg:col-span-2" />
        <div className="skeleton h-56" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
      </div>
    </div>
  );
}

const Page = ({ children }: { children: ReactNode }) => <Suspense fallback={<Splash />}>{children}</Suspense>;
const Inner = ({ children }: { children: ReactNode }) => <Suspense fallback={<PageFallback />}>{children}</Suspense>;

function Root() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

function RequireOrbit() {
  const mode = useOrbit((s) => s.mode);
  if (mode === 'none') return <Navigate to="/start" replace />;
  return <Outlet />;
}

function NotFound() {
  const { t } = useT();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <EmptyState
        icon={Compass}
        title={t('This orbit doesn’t exist', 'Orbit ini tidak ditemukan')}
        description={t('The page you’re looking for has moved or never existed.', 'Halaman yang kamu cari sudah dipindahkan atau tidak pernah ada.')}
        action={
          <Button asChild>
            <Link to="/">{t('Back to Orbit', 'Kembali ke Orbit')}</Link>
          </Button>
        }
      />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <Page><LandingPage /></Page> },
      { path: '/why-orbit', element: <Page><WhyOrbitPage /></Page> },
      { path: '/campus', element: <Page><CampusPage /></Page> },
      { path: '/signin', element: <Page><SignInPage /></Page> },
      { path: '/start', element: <Page><OnboardingPage /></Page> },
      {
        element: <RequireOrbit />,
        children: [
          {
            path: '/app',
            element: <Page><AppShell /></Page>,
            children: [
              { index: true, element: <Inner><TodayPage /></Inner> },
              { path: 'intelligence', element: <Inner><IntelligencePage /></Inner> },
              { path: 'learning', element: <Inner><LearnPage /></Inner> },
              { path: 'universe', element: <Inner><UniversePage /></Inner> },
              { path: 'journey', element: <Inner><JourneyPage /></Inner> },
              { path: 'discover', element: <Inner><DiscoverPage /></Inner> },
              { path: 'progress', element: <Inner><ProgressPage /></Inner> },
              { path: 'journal', element: <Inner><JournalPage /></Inner> },
              { path: 'settings', element: <Inner><SettingsPage /></Inner> },
              { path: '*', element: <NotFound /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  const dark = useIsDark();
  const mobile = useIsMobile();
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <ConfirmHost />
      <Toaster
        position={mobile ? 'top-center' : 'bottom-right'}
        theme={dark ? 'dark' : 'light'}
        offset={mobile ? 16 : 24}
        toastOptions={{
          classNames: {
            toast: '!rounded-2xl !border !border-border !bg-surface !text-foreground !shadow-pop !font-sans',
            description: '!text-muted-foreground',
            actionButton: '!bg-green !text-white !rounded-lg !font-semibold',
          },
        }}
      />
    </TooltipProvider>
  );
}
