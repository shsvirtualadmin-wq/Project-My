import React from 'react';
import { motion, UseInViewOptions, TargetAndTransition } from 'motion/react';

export interface ScrollRevealProps {
  children: React.ReactNode;
  /** Delay before starting animation in seconds */
  delay?: number;
  /** Duration of animation in seconds */
  duration?: number;
  /** Distance in pixels to slide up from bottom */
  distance?: number;
  /** Whether animation should only trigger once when coming into view */
  once?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Fraction of element that must be visible to trigger (0 to 1 or "some" / "all") */
  amount?: UseInViewOptions['amount'];
  /** Optional hover transform */
  whileHover?: TargetAndTransition;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Optional stagger delay for children */
  staggerChildren?: number;
}

/**
 * ScrollReveal component optimized for 60fps GPU performance.
 * Fades and slides elements up from the bottom when scrolled into view.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.4,
  distance = 25,
  once = true,
  className = '',
  amount = 0.1,
  whileHover,
  style,
  staggerChildren,
}) => {
  if (staggerChildren && staggerChildren > 0) {
    return (
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once, amount }}
        variants={{
          hidden: { opacity: 0, y: distance },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration,
              delay,
              ease: [0.16, 1, 0.3, 1],
              staggerChildren: Math.min(staggerChildren, 0.05),
            },
          },
        }}
        whileHover={whileHover}
        style={{ willChange: 'transform, opacity', ...style }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={whileHover}
      style={{ willChange: 'transform, opacity', ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
