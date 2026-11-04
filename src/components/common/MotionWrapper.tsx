'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export { motion, AnimatePresence };

export interface MotionRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

/**
 * MotionReveal provides smooth entrance animations without hiding un-scrolled
 * or iframe-nested content. Avoids aggressive whileInView viewport negative margins
 * that cause blank sections in iframe previews.
 */
export const MotionReveal: React.FC<MotionRevealProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) => {
  const initialY = direction === 'up' ? 14 : direction === 'down' ? -14 : 0;
  const initialX = direction === 'left' ? 14 : direction === 'right' ? -14 : 0;

  return (
    <motion.div
      initial={{ opacity: 0.85, y: initialY, x: initialX }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(delay, 0.2), ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
