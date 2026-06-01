import React from 'react';
import { motion, Variants } from 'framer-motion';

// ─── Shared Variants ──────────────────────────────────────────────────────────

/** Classic fade + rise. Used as the default section entry. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Fade in from the left. */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Fade in from the right. */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Scale + fade – great for cards / visuals. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Pure opacity dissolve. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: 'easeOut' },
  },
};

/**
 * Container variant that orchestrates staggered children.
 * @param stagger seconds between each child
 */
export const staggerContainer = (stagger = 0.12): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.05,
    },
  },
});

// ─── SectionReveal wrapper ────────────────────────────────────────────────────

interface SectionRevealProps {
  children: React.ReactNode;
  /** Framer-Motion variants to use (default: fadeUp) */
  variants?: Variants;
  /** Extra Tailwind classes on the wrapper */
  className?: string;
  /** viewport margin before the animation triggers */
  margin?: string;
}

/**
 * Wraps any block with a scroll-triggered reveal animation.
 * Uses `once: true` so the animation runs only the first time it enters the viewport.
 */
const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  variants = fadeUp,
  className = '',
  margin = '-80px',
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin }}
    variants={variants}
    style={{ willChange: 'opacity, transform' }}
    className={className}
  >
    {children}
  </motion.div>
);

export default SectionReveal;
