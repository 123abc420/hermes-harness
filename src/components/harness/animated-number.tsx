'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

/* ═════════════════════════════════════════════════════════════════════
   ANIMATED NUMBER — Spring-physics countup using framer-motion

   Zero new dependencies — uses useMotionValue + useSpring + useTransform
   from framer-motion which is already installed in the project.

   Respects prefers-reduced-motion: shows final value instantly.

   Usage:
     <AnimatedNumber value={172} />              → "172"
     <AnimatedNumber value={93.5} decimals={1} />  → "93.5"
     <AnimatedNumber value={502} duration={1.5} /> → "502" (slower)
   ═════════════════════════════════════════════════════════════════════ */

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 0.8,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    duration: reduced ? 0 : duration * 1000,
    bounce: 0,
  });
  const display = useTransform(springVal, (v) => v.toFixed(decimals));

  useEffect(() => {
    motionVal.set(value);
  }, [motionVal, value]);

  useEffect(() => {
    if (reduced) return; // skip subscription when reduced-motion is on
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsubscribe;
  }, [display, reduced]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={false}
    >
      {decimals > 0 ? value.toFixed(decimals) : value}
    </motion.span>
  );
}