'use client';

import {
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import * as m from 'motion/react-m';
import { useRef } from 'react';

/**
 * Keeps the upper half of the backdrop clean while the poster-derived lower
 * gradient gently shifts with the page scroll. The wrapper is the scroll
 * target so the animated layer can move without changing the hero layout.
 */
export default function HeroGradient() {
  const targetRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.28, 0.68, 1],
    [0.76, 0.96, 1, 0.84],
  );
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [20, -18]), {
    stiffness: 130,
    damping: 25,
    mass: 0.7,
  });
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 1], [1.035, 1.075]),
    {
      stiffness: 110,
      damping: 26,
      mass: 0.8,
    },
  );

  return (
    <div
      ref={targetRef}
      className='pointer-events-none absolute inset-0 z-10 overflow-hidden'
      aria-hidden='true'
    >
      <m.div
        className='detail-hero-gradient absolute -inset-[6%]'
        style={reducedMotion ? undefined : { opacity, y, scale }}
      />
    </div>
  );
}
