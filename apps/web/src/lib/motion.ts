import type { Transition, Variants } from 'motion/react';

/** Orbit motion tokens — fast, subtle, purposeful. */
export const ease = [0.22, 1, 0.36, 1] as const;

export const dur = {
  micro: 0.18,
  card: 0.28,
  overlay: 0.34,
  section: 0.55,
  page: 0.38,
} as const;

export const spring: Transition = { type: 'spring', stiffness: 380, damping: 34, mass: 0.8 };
export const softSpring: Transition = { type: 'spring', stiffness: 220, damping: 30 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: dur.section, ease } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.section, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: dur.card, ease } },
};

export const stagger = (delay = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren } },
});

/** Props for a section that reveals once when scrolled into view. */
export const reveal = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '0px 0px -12% 0px' },
} as const;
