'use client';

import { type ReactNode } from 'react';
import { motion, type TargetAndTransition } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

type AnimatedVariant = 'default' | 'header';

interface AnimatedSectionProps {
  /** Animation variant: 'default' (fade-up, y:12) or 'header' (fade-down, y:-6) */
  variant?: AnimatedVariant;
  /** Animation delay in seconds (stagger effect) */
  delay?: number;
  /** Optional className for the outer wrapper */
  className?: string;
  children: ReactNode;
}

const VARIANTS: Record<AnimatedVariant, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
  default: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
  header: {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
  },
};

/** Static variant — same as above but with no-op initial/animate for reduced-motion. */
const STATIC: { initial: TargetAndTransition; animate: TargetAndTransition } = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Reusable staggered fade-in wrapper.
 * Replaces the repeated motion.div pattern across tab components.
 * Supports 'default' (fade-up) and 'header' (fade-down) variants.
 * Respects prefers-reduced-motion: renders content instantly without fade.
 */
export function AnimatedSection({ variant = 'default', delay = 0, className, children }: AnimatedSectionProps) {
  const reduced = usePrefersReducedMotion();
  const v = reduced ? STATIC : VARIANTS[variant];
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      transition={reduced ? { duration: 0 } : { duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}