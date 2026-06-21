'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ═════════════════════════════════════════════════════════════════════
   ANIMATED NUMBER — Spring-physics countup using framer-motion

   Zero new dependencies — uses useMotionValue + useSpring + useTransform
   from framer-motion which is already installed in the project.

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
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    duration: duration * 1000,
    bounce: 0,
  });
  const display = useTransform(springVal, (v) => v.toFixed(decimals));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionVal.set(value);
  }, [motionVal, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsubscribe;
  }, [display]);

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