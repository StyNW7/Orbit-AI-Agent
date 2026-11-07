import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { motion, useScroll, useSpring } from 'motion/react';
import { MarketingFooter, MarketingNav, scrollToId, useLenis } from './chrome';
import { Hero } from './Hero';
import { ConnectedSection, HowItWorksSection, ProblemSection } from './StorySections';
import { CapabilitiesSection, IntelligenceSection, JourneyPreview, UniversePreview } from './ProductSections';
import { CampusTeaser, FaqSection, FinalCta, ImpactSection, SdgSection } from './ImpactSections';
import { MissionSection } from './MissionSection';
import { CompassSection } from './CompassSection';
import { FlowSection } from './FlowSection';

export default function LandingPage() {
  useLenis();
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => scrollToId(id), 350);
    return () => clearTimeout(t);
  }, [location.hash]);

  return (
    <div className="min-h-dvh bg-background">
      <motion.div style={{ scaleX: progress }} className="orbit-gradient fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" aria-hidden />
      <MarketingNav />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <MissionSection />
        <ProblemSection />
        <ConnectedSection />
        <FlowSection />
        <CompassSection />
        <HowItWorksSection />
        <UniversePreview />
        <JourneyPreview />
        <IntelligenceSection />
        <CapabilitiesSection />
        <SdgSection />
        <ImpactSection />
        <CampusTeaser />
        <FaqSection />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
