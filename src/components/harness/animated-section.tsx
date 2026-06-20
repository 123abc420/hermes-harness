'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  /** Animation delay in seconds (stagger effect) */
  delay?: number;
  /** Optional className for the outer wrapper */
  className?: string;
  children: ReactNode;
}

/**
 * Reusable staggered fade-in wrapper.
 * Replaces the repeated motion.div pattern across tab components.
 */
export function AnimatedSection({ delay = 0, className, children }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}